import { useEffect, useMemo, useState } from "react";
import { adminMonitoringApi } from "../services/api";


const Card = ({ title, value, sub }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 12,
      minWidth: 200,
    }}
  >
    <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{value ?? "-"}</div>
    {sub ? <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{sub}</div> : null}
  </div>
);

const BarList = ({ title, rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.value || 0));
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No data</div>
      ) : (
        rows.map((r) => (
          <div key={r.key} style={{ display: "grid", gridTemplateColumns: "140px 1fr 50px", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 13 }}>{r.key}</div>
            <div style={{ background: "#f2f2f2", borderRadius: 6, height: 10, overflow: "hidden" }}>
              <div style={{ width: `${Math.round(((r.value || 0) / max) * 100)}%`, height: "100%", background: "#888" }} />
            </div>
            <div style={{ textAlign: "right", fontSize: 13 }}>{r.value ?? 0}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default function AdminMonitoringPage() {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(7);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    try {
      const [o, s] = await Promise.all([
        adminMonitoringApi.overview(),
        adminMonitoringApi.bugStats(days),
      ]);
      setOverview(o.data);
      setStats(s.data);
    } catch (e) {
      setMsg(e?.message || "Eroare la încărcarea dashboard-ului");
    }
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const bugSeries = useMemo(() => stats?.bugsCreatedPerDay || [], [stats]);

  const maxSeries = useMemo(() => {
    const arr = bugSeries.map((x) => x.count || 0);
    return Math.max(1, ...arr);
  }, [bugSeries]);

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: 16 }}>
      <h2>Admin - Monitoring Dashboard</h2>
      {msg && <div style={{ marginBottom: 10 }}>{msg}</div>}

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Card title="Total users" value={overview?.totalUsers} sub="all accounts" />
        <Card title="Active users (24h)" value={overview?.activeUsersLast24h} sub="based on messages" />
        <Card title="Services" value={overview?.totalServices} />
        <Card title="Offers" value={overview?.totalOffers} />
        <Card title="Challenges" value={overview?.totalChallenges} />
        <Card title="Bookings" value={overview?.totalBookings} />
        <Card title="Reviews" value={overview?.totalReviews} />
        <Card title="Offer claims" value={overview?.totalOfferClaims} />
      </div>

      {/* Bugs summary */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Card title="Bug total" value={overview?.bugTotal} />
        <Card title="Bug Open" value={overview?.bugOpen} />
        <Card title="Bug InProgress" value={overview?.bugInProgress} />
        <Card title="Bug Resolved" value={overview?.bugResolved} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>
          Range:&nbsp;
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </label>

        <button type="button" onClick={load}>
          Refresh
        </button>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <BarList title="Bugs by Status" rows={stats?.bugsByStatus || []} />
        <BarList title="Bugs by Severity" rows={stats?.bugsBySeverity || []} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <BarList title="Bugs by Priority" rows={stats?.bugsByPriority || []} />

        {/* Time series chart */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Bugs created per day</div>
          {bugSeries.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No data</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
              {bugSeries.map((d) => (
                <div key={d.day} style={{ width: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    title={`${d.day}: ${d.count}`}
                    style={{
                      width: "100%",
                      height: `${Math.round(((d.count || 0) / maxSeries) * 130)}px`,
                      background: "#888",
                      borderRadius: 6,
                    }}
                  />
                  <div style={{ fontSize: 9, opacity: 0.7, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    {d.day.slice(5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, opacity: 0.8 }}>
        Tip: pagina de bug monitoring rămâne în <b>Admin - Bug Reports</b> (tabel + edit status/severity/priority).
      </div>
    </div>
  );
}
