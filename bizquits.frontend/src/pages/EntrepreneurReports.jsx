import { useEffect, useState } from 'react';
import api from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import './EntrepreneurReports.css';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function EntrepreneurReports() {
  const [activeUsers, setActiveUsers] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('totalBookingsCreated');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [active, campaign, activity] = await Promise.all([
          api.get('/reports/active-users'),
          api.get('/reports/campaign-stats'),
          api.get('/reports/user-activity'),
        ]);
        setActiveUsers(active.data);
        setCampaignStats(campaign.data);
        setUserActivity(Array.isArray(activity.data) ? activity.data : []);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="main-content"><p>Loading reports...</p></div>;
  if (error) return <div className="main-content"><p className="error">{error}</p></div>;

  // Filtering
  const filtered = Array.isArray(userActivity) ? userActivity.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'email') {
      return sortDir === 'asc'
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    }
    return sortDir === 'asc'
      ? a[sortKey] - b[sortKey]
      : b[sortKey] - a[sortKey];
  });

  // Bar chart config
  const bookingsBarData = {
    labels: sorted.map(u => u.email.split('@')[0]),
    datasets: [
      {
        label: 'Created',
        data: sorted.map(u => u.totalBookingsCreated),
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
      {
        label: 'Completed',
        data: sorted.map(u => u.totalBookingsCompleted),
        backgroundColor: '#10b981',
        borderRadius: 4,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 20 }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  // Pie chart config
  const completedBookings = campaignStats?.completedBookings || 0;
  const totalBookings = campaignStats?.totalBookings || 0;
  const pendingBookings = Math.max(0, totalBookings - completedBookings);
  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const bookingsPieData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedBookings, pendingBookings],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0,
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16 }
      }
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="main-content reports-page">
      <div className="reports-header">
        <h1>Business Reports</h1>
        <p>Track your business performance and user engagement</p>
      </div>

      <div className="reports-stats-grid">
        <div className="reports-stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Active Users</div>
          <div className="stat-value">{activeUsers?.activeUsers ?? 0}</div>
        </div>
        <div className="reports-stat-card success">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{totalBookings}</div>
        </div>
        <div className="reports-stat-card warning">
          <div className="stat-icon">✓</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedBookings}</div>
        </div>
        <div className="reports-stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{completionRate}%</div>
        </div>
      </div>

      <div className="reports-charts-section">
        <div className="chart-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Bookings per User
          </h3>
          <div className="chart-wrapper">
            <Bar data={bookingsBarData} options={barOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            Completion Rate
          </h3>
          <div className="pie-chart-wrapper">
            <Pie data={bookingsPieData} options={pieOptions} />
          </div>
          <div className="completion-stats">
            <div className="completion-stat">
              <span className="label">Completed</span>
              <span className="value success">{completedBookings}</span>
            </div>
            <div className="completion-stat">
              <span className="label">Pending</span>
              <span className="value">{pendingBookings}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-table-section">
        <div className="table-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            User Activity
          </h3>
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-table">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          <table className="activity-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('email')}>
                  Email {sortKey === 'email' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('xp')}>
                  XP {sortKey === 'xp' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('level')}>
                  Level {sortKey === 'level' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('totalBookingsCreated')}>
                  Created {sortKey === 'totalBookingsCreated' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('totalBookingsCompleted')}>
                  Completed {sortKey === 'totalBookingsCompleted' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u.email}>
                  <td>{u.email}</td>
                  <td><span className="xp-value">⭐ {u.xp}</span></td>
                  <td><span className="level-badge">Lv. {u.level}</span></td>
                  <td>{u.totalBookingsCreated}</td>
                  <td>{u.totalBookingsCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EntrepreneurReports;
