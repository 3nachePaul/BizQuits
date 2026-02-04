import { useEffect, useState } from "react";
import { bugReportApi } from "../services/api";
import "./BugReportPage.css";

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

const statusLabel = (s) => {
  if (typeof s === "string") return s;
  return ["Open", "InProgress", "Resolved"][s] ?? String(s);
};

const severityColors = {
  0: "#22c55e", // Low - green
  1: "#eab308", // Medium - yellow
  2: "#f97316", // High - orange
  3: "#ef4444", // Critical - red
  Low: "#22c55e",
  Medium: "#eab308",
  High: "#f97316",
  Critical: "#ef4444",
};

const statusColors = {
  0: "#3b82f6", // Open - blue
  1: "#a855f7", // InProgress - purple
  2: "#22c55e", // Resolved - green
  Open: "#3b82f6",
  InProgress: "#a855f7",
  Resolved: "#22c55e",
};

export default function BugReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(1);
  const [priority, setPriority] = useState(1);

  const [myBugs, setMyBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const loadMy = async () => {
    try {
      const res = await bugReportApi.my();
      setMyBugs(res.data || []);
    } catch (err) {
      console.error("Failed to load bugs:", err);
    }
  };

  useEffect(() => {
    loadMy();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await bugReportApi.create({
        title,
        description,
        severity,
        priority,
      });

      setTitle("");
      setDescription("");
      setSeverity(1);
      setPriority(1);

      setMsg("Bug report submitted successfully! ✅");
      setMsgType("success");
      await loadMy();
    } catch (err) {
      setMsg(err?.response?.data?.message || err?.message || "Error submitting bug report");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bug-report-page">
      <div className="bug-report-header">
        <h1>Report a Bug</h1>
        <p>Help us improve by reporting any issues you encounter</p>
      </div>

      <div className="bug-report-content">
        <div className="bug-report-form-section">
          <h2>Submit New Bug Report</h2>
          <form onSubmit={submit} className="bug-report-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Steps to reproduce, what happens, what should happen..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                maxLength={2000}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="severity">Severity</label>
                <select 
                  id="severity"
                  value={severity} 
                  onChange={(e) => setSeverity(Number(e.target.value))}
                >
                  {severityOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select 
                  id="priority"
                  value={priority} 
                  onChange={(e) => setPriority(Number(e.target.value))}
                >
                  {priorityOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Bug Report"}
            </button>

            {msg && (
              <div className={`message ${msgType}`}>
                {msg}
              </div>
            )}
          </form>
        </div>

        <div className="bug-report-list-section">
          <h2>My Bug Reports</h2>
          {myBugs.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p>No bug reports yet</p>
            </div>
          ) : (
            <div className="bug-list">
              {myBugs.map((b) => (
                <div key={b.id} className="bug-card">
                  <div className="bug-card-header">
                    <span className="bug-id">#{b.id}</span>
                    <span 
                      className="bug-status" 
                      style={{ backgroundColor: statusColors[b.status] || statusColors[0] }}
                    >
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <h3 className="bug-title">{b.title}</h3>
                  <p className="bug-description">{b.description}</p>
                  <div className="bug-meta">
                    <span 
                      className="bug-severity"
                      style={{ backgroundColor: severityColors[b.severity] || severityColors[0] }}
                    >
                      {typeof b.severity === "string" ? b.severity : severityOptions[b.severity]?.label}
                    </span>
                    <span className="bug-priority">
                      {typeof b.priority === "string" ? b.priority : priorityOptions[b.priority]?.label} Priority
                    </span>
                    <span className="bug-date">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
