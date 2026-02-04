import { useEffect, useState } from "react";
import { adminBugReportApi } from "../services/api";


const severityOptions = [
  { value: 0, label: "Low" },
  { value: 1, label: "Medium" },
  { value: 2, label: "High" },
  { value: 3, label: "Critical" },
];

const priorityOptions = [
  { value: 0, label: "Low" },
  { value: 1, label: "Normal" },
  { value: 2, label: "High" },
  { value: 3, label: "Urgent" },
];

const statusOptions = [
  { value: 0, label: "Open" },
  { value: 1, label: "InProgress" },
  { value: 2, label: "Resolved" },
];

const normalizeEnum = (v, arr) => {
  if (typeof v === "string") {
    const idx = arr.findIndex((x) => x.label === v);
    return idx >= 0 ? arr[idx].value : 0;
  }
  return Number(v);
};

export default function AdminBugReportsPage() {
  const [bugs, setBugs] = useState([]);
  const [msg, setMsg] = useState("");

  // ✅ filtre (null = fără filtru)
  const [status, setStatus] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [priority, setPriority] = useState(null);

  const load = async () => {
    const res = await adminBugReportApi.getAll({
      status,
      severity,
      priority,
    });
    setBugs(res.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload automat când schimbi filtrele
  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, severity, priority]);

  const updateStatus = async (id, value) => {
    setMsg("");
    try {
      await adminBugReportApi.updateStatus(id, Number(value));
      setMsg("Status actualizat ✅");
      await load();
    } catch (e) {
      setMsg(e?.message || "Eroare la update status");
    }
  };

  const updateSeverity = async (id, value) => {
    setMsg("");
    try {
      await adminBugReportApi.updateSeverity(id, Number(value));
      setMsg("Severity actualizat ✅");
      await load();
    } catch (e) {
      setMsg(e?.message || "Eroare la update severity");
    }
  };

  const updatePriority = async (id, value) => {
    setMsg("");
    try {
      await adminBugReportApi.updatePriority(id, Number(value));
      setMsg("Priority actualizat ✅");
      await load();
    } catch (e) {
      setMsg(e?.message || "Eroare la update priority");
    }
  };

  const resetFilters = () => {
    setStatus(null);
    setSeverity(null);
    setPriority(null);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2>Admin - Bug Reports</h2>
      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}

      {/* ✅ Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <label>
          Status:&nbsp;
          <select
            value={status ?? ""}
            onChange={(e) => setStatus(e.target.value === "" ? null : Number(e.target.value))}
          >
            <option value="">All</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Severity:&nbsp;
          <select
            value={severity ?? ""}
            onChange={(e) => setSeverity(e.target.value === "" ? null : Number(e.target.value))}
          >
            <option value="">All</option>
            {severityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority:&nbsp;
          <select
            value={priority ?? ""}
            onChange={(e) => setPriority(e.target.value === "" ? null : Number(e.target.value))}
          >
            <option value="">All</option>
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={resetFilters}>
          Reset
        </button>
      </div>

      {bugs.length === 0 ? (
        <p>Nu există bug reports.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Titlu</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.userEmail || b.userId}</td>
                <td>{b.title}</td>

                <td>
                  <select
                    value={normalizeEnum(b.status, statusOptions)}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                  >
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <select
                    value={normalizeEnum(b.severity, severityOptions)}
                    onChange={(e) => updateSeverity(b.id, e.target.value)}
                  >
                    {severityOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <select
                    value={normalizeEnum(b.priority, priorityOptions)}
                    onChange={(e) => updatePriority(b.id, e.target.value)}
                  >
                    {priorityOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
