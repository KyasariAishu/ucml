import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth.js";
import { getDevices } from "../api/devices.js";
import "../styles/dashboard.css";

const PAGE_SIZE = 5; // must match settings.py's REST_FRAMEWORK["PAGE_SIZE"]

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
  const [page, setPage] = useState(1); // DRF pages are 1-indexed
  const [openDevice, setOpenDevice] = useState(null);
  const [error, setError] = useState("");

  const loadDevices = useCallback((pageNum) => {
    getDevices(pageNum)
      .then((data) => {
        setDevices(data.results);
        setCount(data.count);
      })
      .catch(() => setError("Could not load devices."));
  }, []);

  // Load the logged-in user once.
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        logout();
        navigate("/login");
      });
  }, [navigate]);

  // Load devices every time the page changes.
  useEffect(() => {
    loadDevices(page);
  }, [page, loadDevices]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function toggleDevice(id) {
    setOpenDevice((current) => (current === id ? null : id));
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
          <h1 className="dash-title">Welcome, {user.full_name || user.email}</h1>
        </div>
        <button className="dash-logout" onClick={handleLogout}>Log out</button>
      </header>

      <section className="dash-overview">
        <p>
          This is a mockup dashboard for UCML. Below is the list of network
          devices.
        </p>
      </section>

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
            />
          ))
        )}
      </section>

      <div className="dash-pager">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={i + 1 === page ? "dash-page-active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function DeviceRow({ device, isOpen, onToggle }) {
  return (
    <div className="device-row">
      <button className="device-row-bar" onClick={onToggle}>
        <span className="device-row-main">
          <strong>{device.device_name}</strong>
          <span className="device-row-meta">
            {device.device_type} · {formatDate(device.created_at)}
          </span>
        </span>
        <span className={`chevron ${isOpen ? "chevron-open" : ""}`}>▾</span>
      </button>

      {isOpen ? (
        <dl className="device-fields">
          <div><dt>Vendor</dt><dd>{device.vendor}</dd></div>
          <div><dt>Model</dt><dd>{device.model}</dd></div>
          <div><dt>Topology</dt><dd>{device.topology}</dd></div>
          <div><dt>Port</dt><dd>{device.port_no}</dd></div>
          <div><dt>IP address</dt><dd>{device.ip_address}</dd></div>
          <div><dt>Subnet (CIDR)</dt><dd>/{device.subnet_mask}</dd></div>
          <div><dt>Gateway</dt><dd>{device.gateway}</dd></div>
          <div><dt>MAC address</dt><dd>{device.mac_address}</dd></div>
        </dl>
      ) : null}
    </div>
  );
}