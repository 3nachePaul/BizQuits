import { useEffect, useState } from "react";
import { adminBugReportApi } from "../services/api";
import "./AdminBugReportsPage.css";

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

const severityColors = {
  0: "#22c55e",
  1: "#eab308",
  2: "#f97316",
  3: "#ef4444",
};

const statusColors = {
  0: "#3b82f6",
  1: "#a855f7",
  2: "#22c55e",
};

export default function AdminBugReportsPage() {
  const [bugs, setBugs] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [priority, setPriority] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminBugReportApi.getAll({
        status,
        severity,
        priority,
      });
      setBugs(res.data || []);
    } catch (err) {
      console.error("Failed to load bugs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filters change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, severity, priority]);

  const updateStatus = async (id, value) => {
    setMsg("");
    try {
      await adminBugReportApi.updateStatus(id, Number(value));
      setMsg("Status updated ✅");
      setMsgType("success");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || e?.message || "Error updating status");
      setMsgType("error");
    }
  };

  const updateSeverity = async (id, value) => {
    setMsg("");
    try {
      await adminBugReportApi.updateSeverity(id, Number(value));
      setMsg("Severity updated ✅");
      setMsgType("success");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || e?.message || "Error updating severity");
      setMsgType("error");
    }
  };

  const updatePriority = async (id, value) => {
    setMsg("");
    try {
      await adminBugReportApi.updatePriority(id, Number(value));
      setMsg("Priority updated ✅");
      setMsgType("success");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || e?.message || "Error updating priority");
      setMsgType("error");
    }
  };

  const resetFilters = () => {
    setStatus(null);
    setSeverity(null);
    setPriority(null);
  };

  return (
    <div className="admin-bugs-page">
      <div className="admin-bugs-header">
        <h1>Bug Reports Management</h1>
        <p>Review and manage user-reported bugs</p>
      </div>

      {msg && (
        <div className={`admin-bugs-message ${msgType}`}>
          {msg}
        </div>
      )}

      {/* Filter bar */}
      <div className="admin-bugs-filters">
        <div className="filter-group">
          <label>Status:</label>
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
        </div>

        <div className="filter-group">
          <label>Severity:</label>
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
        </div>

        <div className="filter-group">
          <label>Priority:</label>
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
        </div>

        <button type="button" onClick={resetFilters} className="reset-btn">
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="admin-bugs-loading">Loading bug reports...</div>
      ) : bugs.length === 0 ? (
        <div className="admin-bugs-empty">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p>No bug reports found</p>
        </div>
      ) : (
        <div className="admin-bugs-table-container">
          <table className="admin-bugs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Title</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Priority</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.id}>
                  <td className="bug-id">#{b.id}</td>
                  <td className="bug-user">{b.userEmail || `User #${b.userId}`}</td>
                  <td className="bug-title" title={b.description}>
                    {b.title}
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={normalizeEnum(b.status, statusOptions)}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      style={{ 
                        backgroundColor: statusColors[normalizeEnum(b.status, statusOptions)] + "20",
                        borderColor: statusColors[normalizeEnum(b.status, statusOptions)]
                      }}
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
                      className="severity-select"
                      value={normalizeEnum(b.severity, severityOptions)}
                      onChange={(e) => updateSeverity(b.id, e.target.value)}
                      style={{ 
                        backgroundColor: severityColors[normalizeEnum(b.severity, severityOptions)] + "20",
                        borderColor: severityColors[normalizeEnum(b.severity, severityOptions)]
                      }}
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
                      className="priority-select"
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
                  <td className="bug-date">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
