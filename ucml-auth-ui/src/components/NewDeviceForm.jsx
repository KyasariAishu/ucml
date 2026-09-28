import { useState } from "react";
import { createDevice } from "../api/devices.js";

const VENDORS = [
  { value: "NOKIA", label: "Nokia" },
  { value: "CISCO", label: "Cisco" },
  { value: "CIENA", label: "Ciena" },
];
const TOPOLOGIES = ["B4A", "B4B", "B4C", "B4E"];

const EMPTY = {
  vendor: "",
  model: "",
  device_name: "",
  device_type: "",
  topology: "B4A",
  port_no: "",
  ip_address: "",
  subnet_mask: "",
  gateway: "",
  mac_address: "",
  local_as: "",
  system_ip: "",
  customer_vrf_id: "",
  customer_vrf_name: "",
};

export default function NewDeviceForm({ initialVendor = "", onCancel, onCreated }) {
  const [form, setForm] = useState({ ...EMPTY, vendor: initialVendor });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Empty optional numbers/IPs must be null, not "", or the API rejects them.
    const payload = {
      ...form,
      subnet_mask: Number(form.subnet_mask),
      local_as: form.local_as === "" ? null : Number(form.local_as),
      system_ip: form.system_ip === "" ? null : form.system_ip,
    };

    setSaving(true);
    try {
      const created = await createDevice(payload);
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <h2 className="modal-title">Add device</h2>

        <div className="modal-grid">
          <div className="field-edit">
            <label>Vendor</label>
            <select name="vendor" value={form.vendor} onChange={update} required>
              <option value="" disabled>Select vendor</option>
              {VENDORS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="field-edit">
            <label>Model</label>
            <input name="model" value={form.model} onChange={update} placeholder="e.g. 7750 SR8" required />
          </div>
          <div className="field-edit">
            <label>Device name</label>
            <input name="device_name" value={form.device_name} onChange={update} required />
          </div>
          <div className="field-edit">
            <label>Device type</label>
            <input name="device_type" value={form.device_type} onChange={update} placeholder="e.g. router" required />
          </div>
          <div className="field-edit">
            <label>Topology</label>
            <select name="topology" value={form.topology} onChange={update}>
              {TOPOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field-edit">
            <label>Port</label>
            <input name="port_no" value={form.port_no} onChange={update} required />
          </div>
          <div className="field-edit">
            <label>IP address</label>
            <input name="ip_address" value={form.ip_address} onChange={update} required />
          </div>
          <div className="field-edit">
            <label>Subnet (CIDR)</label>
            <input type="number" min="0" max="32" name="subnet_mask" value={form.subnet_mask} onChange={update} required />
          </div>
          <div className="field-edit">
            <label>Gateway</label>
            <input name="gateway" value={form.gateway} onChange={update} required />
          </div>
          <div className="field-edit">
            <label>MAC address</label>
            <input name="mac_address" value={form.mac_address} onChange={update} placeholder="00:1A:2B:3C:4D:5E" required />
          </div>
          <div className="field-edit">
            <label>Local AS (optional)</label>
            <input type="number" name="local_as" value={form.local_as} onChange={update} />
          </div>
          <div className="field-edit">
            <label>System IP (optional)</label>
            <input name="system_ip" value={form.system_ip} onChange={update} />
          </div>
          <div className="field-edit">
            <label>Customer VRF ID (optional)</label>
            <input name="customer_vrf_id" value={form.customer_vrf_id} onChange={update} />
          </div>
          <div className="field-edit">
            <label>Customer VRF name (optional)</label>
            <input name="customer_vrf_name" value={form.customer_vrf_name} onChange={update} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create device"}
          </button>
          <button className="btn" type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          {error ? <span className="status-text status-error">{error}</span> : null}
        </div>
      </form>
    </div>
  );
}