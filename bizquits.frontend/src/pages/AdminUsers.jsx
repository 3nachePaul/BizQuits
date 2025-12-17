import { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../components/Toast';
import './AdminUsers.css';

const Icons = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    role: '',
    companyName: '',
    cui: '',
    isApproved: false
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await adminService.getAllUsers();
      // Transform data to include companyName and cui from entrepreneurProfile
      const transformedUsers = response.data.map(user => ({
        ...user,
        companyName: user.entrepreneurProfile?.companyName || null,
        cui: user.entrepreneurProfile?.cui || null,
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

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      newPassword: '',
      confirmPassword: '',
      role: user.role,
      companyName: user.companyName || '',
      cui: user.cui || '',
      isApproved: user.isApproved || false
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({
      email: '',
      newPassword: '',
      confirmPassword: '',
      role: '',
      companyName: '',
      cui: '',
      isApproved: false
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (editForm.newPassword && editForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setEditLoading(true);
    try {
      const updateData = {
        email: editForm.email,
        role: editForm.role
      };

      if (editForm.newPassword) {
        updateData.newPassword = editForm.newPassword;
      }

      if (editForm.role === 'Entrepreneur') {
        updateData.companyName = editForm.companyName;
        updateData.cui = editForm.cui;
        updateData.isApproved = editForm.isApproved;
      }

      await adminService.updateUser(editingUser.id, updateData);
      showToast('User updated successfully', 'success');
      closeEditModal();
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data || 'Failed to update user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deletingUser.id);
      showToast('User deleted successfully', 'success');
      closeDeleteModal();
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data || 'Failed to delete user', 'error');
    } finally {
      setDeleteLoading(false);
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
                          {user.isApproved ? <><span className="status-icon">{Icons.check}</span> Approved</> : <><span className="status-icon">{Icons.clock}</span> Pending</>}
                        </span>
                      ) : (
                        <span className="status-badge status-approved"><span className="status-icon">{Icons.check}</span> Active</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-ghost btn-sm btn-icon" 
                          title="Edit user"
                          onClick={() => openEditModal(user)}
                        >
                          {Icons.edit}
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm btn-icon btn-danger" 
                          title="Delete user"
                          onClick={() => openDeleteModal(user)}
                        >
                          {Icons.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={closeEditModal}>
                {Icons.close}
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    required
                  >
                    <option value="Client">Client</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {editForm.role === 'Entrepreneur' && (
                  <>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CUI</label>
                      <input
                        type="text"
                        value={editForm.cui}
                        onChange={(e) => setEditForm({...editForm, cui: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.isApproved}
                          onChange={(e) => setEditForm({...editForm, isApproved: e.target.checked})}
                        />
                        <span>Approved</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="form-divider">
                  <span>Change Password (optional)</span>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                    placeholder="Leave empty to keep current"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="modal-close" onClick={closeDeleteModal}>
                {Icons.close}
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">{Icons.warning}</span>
                <div>
                  <p><strong>Are you sure you want to delete this user?</strong></p>
                  <p>User: <strong>{deletingUser?.email}</strong></p>
                  <p>This action cannot be undone. All data associated with this user will be permanently deleted.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
