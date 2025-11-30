import { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await adminService.getAllUsers();
      // Transform data to include companyName from entrepreneurProfile
      const transformedUsers = response.data.map(user => ({
        ...user,
        companyName: user.entrepreneurProfile?.companyName || null,
        isApproved: user.entrepreneurProfile?.isApproved
      }));
      setUsers(transformedUsers);
    } catch (err) {
      setError('Failed to load users. Make sure you have admin permissions.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'badge-danger';
      case 'Entrepreneur': return 'badge-warning';
      case 'Client': return 'badge-info';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="admin-users-container">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>View and manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={fetchUsers}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="filters-section">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Entrepreneur">Entrepreneur</option>
          <option value="Client">Client</option>
        </select>
      </div>

      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{users.filter(u => u.role === 'Admin').length}</span>
          <span className="stat-label">Admins</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{users.filter(u => u.role === 'Entrepreneur').length}</span>
          <span className="stat-label">Entrepreneurs</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{users.filter(u => u.role === 'Client').length}</span>
          <span className="stat-label">Clients</span>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          {isLoading ? (
            <div className="loading-state">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users found matching your criteria.</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.companyName || '-'}</td>
                    <td>
                      {user.role === 'Entrepreneur' ? (
                        <span className={`status-badge ${user.isApproved ? 'status-approved' : 'status-pending'}`}>
                          {user.isApproved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      ) : (
                        <span className="status-badge status-approved">✓ Active</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
