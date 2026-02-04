import { useEffect, useMemo, useState } from "react";
import { adminMonitoringApi } from "../services/api";
import "./AdminMonitoringPage.css";

const Card = ({ title, value, sub, color }) => (
  <div className="monitoring-card" style={{ borderTopColor: color || "var(--primary)" }}>
    <div className="card-title">{title}</div>
    <div className="card-value">{value ?? "-"}</div>
    {sub && <div className="card-sub">{sub}</div>}
  </div>
);

const BarList = ({ title, rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.value || 0));
  return (
    <div className="bar-list-card">
      <div className="bar-list-title">{title}</div>
      {rows.length === 0 ? (
        <div className="bar-list-empty">No data</div>
      ) : (
        <div className="bar-list-items">
          {rows.map((r) => (
            <div key={r.key} className="bar-list-item">
              <div className="bar-list-label">{r.key}</div>
              <div className="bar-list-bar-container">
                <div 
                  className="bar-list-bar" 
                  style={{ width: `${Math.round(((r.value || 0) / max) * 100)}%` }} 
                />
              </div>
              <div className="bar-list-value">{r.value ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminMonitoringPage() {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(7);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const [o, s] = await Promise.all([
        adminMonitoringApi.overview(),
        adminMonitoringApi.bugStats(days),
      ]);
      setOverview(o.data);
      setStats(s.data);
    } catch (e) {
      setMsg(e?.response?.data?.message || e?.message || "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const bugSeries = useMemo(() => stats?.bugsCreatedPerDay || [], [stats]);

  const maxSeries = useMemo(() => {
    const arr = bugSeries.map((x) => x.count || 0);
    return Math.max(1, ...arr);
  }, [bugSeries]);

  if (loading) {
    return (
      <div className="admin-monitoring-page">
        <div className="monitoring-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-monitoring-page">
      <div className="monitoring-header">
        <h1>Monitoring Dashboard</h1>
        <p>Platform overview and statistics</p>
      </div>

      {msg && <div className="monitoring-error">{msg}</div>}

      {/* KPI cards */}
      <div className="monitoring-cards">
        <Card title="Total Users" value={overview?.totalUsers} sub="all accounts" color="#6366f1" />
        <Card title="Active (24h)" value={overview?.activeUsersLast24h} sub="by messages" color="#22c55e" />
        <Card title="Services" value={overview?.totalServices} color="#f59e0b" />
        <Card title="Offers" value={overview?.totalOffers} color="#ec4899" />
        <Card title="Challenges" value={overview?.totalChallenges} color="#8b5cf6" />
        <Card title="Bookings" value={overview?.totalBookings} color="#0ea5e9" />
        <Card title="Reviews" value={overview?.totalReviews} color="#14b8a6" />
        <Card title="Offer Claims" value={overview?.totalOfferClaims} color="#f97316" />
      </div>

      {/* Bug summary */}
      <div className="monitoring-section-title">Bug Reports Summary</div>
      <div className="monitoring-bug-cards">
        <Card title="Total Bugs" value={overview?.bugTotal} color="#64748b" />
        <Card title="Open" value={overview?.bugOpen} color="#3b82f6" />
        <Card title="In Progress" value={overview?.bugInProgress} color="#a855f7" />
        <Card title="Resolved" value={overview?.bugResolved} color="#22c55e" />
      </div>

      {/* Controls */}
      <div className="monitoring-controls">
        <div className="control-group">
          <label>Time Range:</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        <button type="button" onClick={load} className="refresh-btn">
          Refresh
        </button>
      </div>

      {/* Charts */}
      <div className="monitoring-charts">
        <BarList title="Bugs by Status" rows={stats?.bugsByStatus || []} />
        <BarList title="Bugs by Severity" rows={stats?.bugsBySeverity || []} />
      </div>

      <div className="monitoring-charts">
        <BarList title="Bugs by Priority" rows={stats?.bugsByPriority || []} />

        {/* Time series chart */}
        <div className="time-series-card">
          <div className="time-series-title">Bugs Created Per Day</div>
          {bugSeries.length === 0 ? (
            <div className="time-series-empty">No data</div>
          ) : (
            <div className="time-series-chart">
              {bugSeries.map((d) => (
                <div key={d.day} className="time-series-bar-wrapper">
                  <div
                    className="time-series-bar"
                    title={`${d.day}: ${d.count}`}
                    style={{
                      height: `${Math.max(4, Math.round(((d.count || 0) / maxSeries) * 130))}px`,
                    }}
                  />
                  <div className="time-series-label">{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="monitoring-tip">
        💡 Manage individual bug reports in <strong>Admin → Bug Reports</strong>
      </div>
    </div>
  );
}
