import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth.js";
import { getDevices, updateDevice, generateConfig, getConfigJob } from "../api/devices.js";
import "../styles/dashboard.css";
import NewDeviceForm from "../components/NewDeviceForm.jsx";

const PAGE_SIZE = 5;
const TOPOLOGIES = ["B4A", "B4B", "B4C", "B4E"];

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [openDevice, setOpenDevice] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(null); // null = closed, { vendor } = open

  const loadDevices = useCallback((pageNum) => {
    getDevices(pageNum)
      .then((data) => {
        setDevices(data.results);
        setCount(data.count);
      })
      .catch(() => setError("Could not load devices."));
  }, []);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        logout();
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    loadDevices(page);
  }, [page, loadDevices]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function toggleDevice(id) {
    setOpenDevice((current) => (current === id ? null : id));
  }

  function handleDeviceSaved(updated) {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  function handleDeviceCreated() {
  setCreating(null);
  // Newest devices sort first, so go to page 1 to show the new one.
  if (page === 1) loadDevices(1);
  else setPage(1);
}

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return <p className="dash-loading">Loading…</p>;
  }

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <div>
          <p className="dash-eyebrow">UCML</p>
          {/* <h1 className="dash-title">Welcome, {user.full_name || user.email}</h1> */}
        </div>
        <button className="dash-logout" onClick={handleLogout}>Log out</button>
      </header>

      <section className="dash-overview">
        <p>This is a mockup dashboard for UCML. Below is the list of network devices.</p>
      </section>
      <div className="dash-toolbar">
        <button className="btn btn-primary" onClick={() => setCreating({ vendor: "" })}>
          Add device
        </button>
      </div>

      {creating ? (
        <NewDeviceForm
          initialVendor={creating.vendor}
          onCancel={() => setCreating(null)}
          onCreated={handleDeviceCreated}
        />
      ) : null}
      {error ? <p className="dash-error">{error}</p> : null}

      <section className="dash-groups">
        {devices.length === 0 ? (
          <p className="dash-empty">No devices yet.</p>
        ) : (
          devices.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              isOpen={openDevice === device.id}
              onToggle={() => toggleDevice(device.id)}
              onSaved={handleDeviceSaved}
              onCreateFrom={() => setCreating({ vendor: device.vendor })}
            />
          ))
        )}
      </section>

      <div className="dash-pager">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={i + 1 === page ? "dash-page-active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
      </div>
    </div>
  );
}

// Fields the user can edit. Vendor and model are deliberately excluded --
// the backend's DeviceUpdateSerializer marks them read_only too, so this
// is a UI convenience, not the only thing stopping a change.
const EDITABLE_FIELDS = [
  "device_name", "device_type", "topology", "port_no", "ip_address",
  "subnet_mask", "gateway", "mac_address", "local_as", "system_ip",
  "customer_vrf_id", "customer_vrf_name",
];

function DeviceRow({ device, isOpen, onToggle, onSaved,onCreateFrom }) {
  const [form, setForm] = useState(device);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [jobStatus, setJobStatus] = useState(null); // null | PENDING | RUNNING | SUCCESS | FAILED
  const [generatedConfig, setGeneratedConfig] = useState("");
  const [jobError, setJobError] = useState("");
  const pollRef = useRef(null);

  // Keep the form in sync if the device prop changes from outside (e.g. after save).
  useEffect(() => setForm(device), [device]);

  // Stop polling if this row unmounts (e.g. navigating to another page of results).
  useEffect(() => () => clearInterval(pollRef.current), []);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    try {
      const payload = {};
      for (const key of EDITABLE_FIELDS) payload[key] = form[key];
      const updated = await updateDevice(device.id, payload);
      onSaved(updated);
      setSaveMessage("Saved.");
    } catch (err) {
      setSaveMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
  setJobError("");
  setGeneratedConfig("");
  setJobStatus("PENDING");

  try {
    const job = await generateConfig(device.id);
    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 15 seconds at 1 poll/second

    pollRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const latest = await getConfigJob(job.id);
        setJobStatus(latest.status);

        if (latest.status === "SUCCESS") {
          clearInterval(pollRef.current);
          setGeneratedConfig(latest.generated_config);
        } else if (latest.status === "FAILED") {
          clearInterval(pollRef.current);
          setJobError(latest.error_message || "Config generation failed.");
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(pollRef.current);
          setJobStatus(null);
          setJobError("This is taking longer than expected. Check that the Celery worker is running.");
        }
      } catch {
        clearInterval(pollRef.current);
        setJobStatus(null);
        setJobError("Lost track of the job status.");
      }
    }, 1000);
  } catch (err) {
    setJobStatus(null);
    setJobError(err.message);
  }
}

  function handleDownload() {
    const blob = new Blob([generatedConfig], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${device.device_name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isBusy = jobStatus === "PENDING" || jobStatus === "RUNNING";

  return (
    <div className="device-row">
      <button className="device-row-bar" onClick={onToggle}>
        <span className="device-row-main">
          <strong>{device.device_name}</strong>
          <span className="device-row-meta">{device.device_type} · {formatDate(device.created_at)}</span>
        </span>
        <span className={`chevron ${isOpen ? "chevron-open" : ""}`}>▾</span>
      </button>

      {isOpen ? (
        <div className="device-fields">
          <div className="field-locked"><label>Vendor</label><input value={device.vendor} disabled /></div>
          <div className="field-locked"><label>Model</label><input value={device.model} disabled /></div>

          <div className="field-edit">
            <label>Device name</label>
            <input name="device_name" value={form.device_name} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Device type</label>
            <input name="device_type" value={form.device_type} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Topology</label>
            <select name="topology" value={form.topology} onChange={updateField}>
              {TOPOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field-edit">
            <label>Port</label>
            <input name="port_no" value={form.port_no} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>IP address</label>
            <input name="ip_address" value={form.ip_address} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Subnet (CIDR)</label>
            <input type="number" min="0" max="32" name="subnet_mask" value={form.subnet_mask} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Gateway</label>
            <input name="gateway" value={form.gateway} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>MAC address</label>
            <input name="mac_address" value={form.mac_address} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Local AS</label>
            <input type="number" name="local_as" value={form.local_as ?? ""} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>System IP</label>
            <input name="system_ip" value={form.system_ip ?? ""} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Customer VRF ID</label>
            <input name="customer_vrf_id" value={form.customer_vrf_id ?? ""} onChange={updateField} />
          </div>
          <div className="field-edit">
            <label>Customer VRF name</label>
            <input name="customer_vrf_name" value={form.customer_vrf_name ?? ""} onChange={updateField} />
          </div>

          <div className="device-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="btn" onClick={handleGenerate} disabled={isBusy}>
              {isBusy ? "Generating…" : "Generate Config"}
            </button>
            <button className="btn" onClick={handleDownload} disabled={!generatedConfig}>
              Download
            </button>
            <button className="btn" onClick={onCreateFrom}>
              Add device with this vendor
            </button>
            {saveMessage ? <span className="status-text">{saveMessage}</span> : null}
            {jobStatus === "SUCCESS" ? <span className="status-text status-success">Config ready.</span> : null}
            {jobError ? <span className="status-text status-error">{jobError}</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}