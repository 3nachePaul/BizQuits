import { useEffect, useState } from "react";
import { bugReportApi } from "../services/api";


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
  // dacă backend returnează enum string: "Open" etc.
  if (typeof s === "string") return s;
  // dacă returnează int:
  return ["Open", "InProgress", "Resolved"][s] ?? String(s);
};

export default function BugReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(1);
  const [priority, setPriority] = useState(1);

  const [myBugs, setMyBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadMy = async () => {
    const res = await bugReportApi.my();
    setMyBugs(res.data || []);
  };

  useEffect(() => {
    loadMy().catch(() => {});
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

      setMsg("Bug report trimis ✅");
      await loadMy();
    } catch (err) {
      setMsg(err?.message || "Eroare la trimiterea bug report-ului");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Raportează un bug</h2>

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        <input
          placeholder="Titlu"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Descriere (pași de reproducere, ce se întâmplă, ce ar trebui să se întâmple)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <label>
            Severitate&nbsp;
            <select value={severity} onChange={(e) => setSeverity(Number(e.target.value))}>
              {severityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label>
            Prioritate&nbsp;
            <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Se trimite..." : "Trimite bug report"}
        </button>

        {msg && <div>{msg}</div>}
      </form>

      <h3>Bug-urile mele</h3>
      {myBugs.length === 0 ? (
        <p>Nu ai bug-uri raportate încă.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Titlu</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {myBugs.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{statusLabel(b.status)}</td>
                <td>{typeof b.severity === "string" ? b.severity : severityOptions[b.severity]?.label}</td>
                <td>{typeof b.priority === "string" ? b.priority : priorityOptions[b.priority]?.label}</td>
                <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
