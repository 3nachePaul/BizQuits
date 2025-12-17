import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, gamificationApi } from '../services/api';
import { useToast } from '../components/Toast';
import './Profile.css';

const Icons = {
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  entrepreneur: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  client: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M5.5 21a8.5 8.5 0 0 1 13 0"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
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
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
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
  )
};

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    companyName: '',
    cui: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      // 1) profile
      const profileRes = await userService.getProfile();
      const prof = profileRes.data;
      setProfile(prof);

      // 2) gamification (doar pt Client)
      if (prof?.role === 'Client') {
        try {
          const gRes = await gamificationApi.me();
          setGamification(gRes.data);
        } catch (gErr) {
          console.error('Error fetching gamification:', gErr);
          setGamification(null);
        }
      } else {
        setGamification(null);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');

      // Fallback to auth context data
      if (authUser) {
        setProfile({
          email: authUser.email,
          role: authUser.role,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      email: profile?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      companyName: profile?.entrepreneurProfile?.companyName || '',
      cui: profile?.entrepreneurProfile?.cui || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      companyName: '',
      cui: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match if changing
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setEditLoading(true);
    try {
      const updateData = {};
      
      // Only include changed fields
      if (editForm.email && editForm.email !== profile?.email) {
        updateData.email = editForm.email;
      }
      if (editForm.newPassword) {
        updateData.currentPassword = editForm.currentPassword;
        updateData.newPassword = editForm.newPassword;
      }
      if (editForm.companyName && editForm.companyName !== profile?.entrepreneurProfile?.companyName) {
        updateData.companyName = editForm.companyName;
      }
      if (editForm.cui && editForm.cui !== profile?.entrepreneurProfile?.cui) {
        updateData.cui = editForm.cui;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }

      const response = await userService.updateProfile(updateData);
      setProfile(response.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      // If email changed, user needs to re-login
      if (updateData.email) {
        toast.info('Email changed. Please log in again.');
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      const message = err.response?.data || 'Failed to update profile';
      toast.error(typeof message === 'string' ? message : 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (profile?.role === 'Admin') {
      toast.error('Admin accounts cannot be deleted from here');
      return;
    }

    setDeleteLoading(true);
    try {
      await userService.deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      setShowDeleteModal(false);
      setTimeout(() => logout(), 1500);
    } catch (err) {
      const message = err.response?.data || 'Failed to delete account';
      toast.error(typeof message === 'string' ? message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return Icons.admin;
      case 'Entrepreneur': return Icons.entrepreneur;
      case 'Client': return Icons.client;
      default: return Icons.client;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'badge-admin';
      case 'Entrepreneur': return 'badge-entrepreneur';
      case 'Client': return 'badge-client';
      default: return '';
    }
  };

  // UI level curve (exp simplu) – trebuie să fie la fel și în backend
  // XP total necesar pt level L: threshold(L) = 80 * (L-1)^1.7
  const levelThreshold = (level) => {
    if (!level || level <= 1) return 0;
    return Math.floor(80 * Math.pow(level - 1, 1.7));
  };

  const levelProgress = useMemo(() => {
    if (!gamification) return null;

    const xp = gamification.xp ?? 0;
    const level = gamification.level ?? 1;

    const currentThreshold = levelThreshold(level);
    const nextThreshold = levelThreshold(level + 1);

    const intoLevel = xp - currentThreshold;
    const neededThisLevel = Math.max(1, nextThreshold - currentThreshold);

    const pct = Math.max(0, Math.min(100, Math.round((intoLevel / neededThisLevel) * 100)));

    return {
      xp,
      level,
      currentThreshold,
      nextThreshold,
      intoLevel: Math.max(0, intoLevel),
      neededThisLevel,
      pct,
    };
  }, [gamification]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          <span className="alert-icon">{Icons.warning}</span>
          <span>{error}</span>
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-main">
          {/* Profile Card */}
          <div className="profile-card card">
            <div className="profile-header">
              <div className="profile-avatar">
                {getRoleIcon(profile?.role)}
              </div>
              <div className="profile-info">
                <h2>{profile?.email}</h2>
                <span className={`role-badge ${getRoleBadgeClass(profile?.role)}`}>
                  {profile?.role}
                </span>
              </div>
              {!isEditing && (
                <button className="btn btn-secondary btn-sm edit-profile-btn" onClick={startEditing}>
                  <span className="btn-icon">{Icons.edit}</span>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="edit-profile-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="form-divider">
                  <span>Change Password (optional)</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                    placeholder="Required to change password"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={editForm.confirmPassword}
                      onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                {profile?.entrepreneurProfile && (
                  <>
                    <div className="form-divider">
                      <span>Company Information</span>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CUI (Tax ID)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editForm.cui}
                          onChange={(e) => setEditForm({ ...editForm, cui: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={cancelEditing} disabled={editLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{profile?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Type</span>
                  <span className="detail-value">{profile?.role}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">#{profile?.id || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Client Gamification */}
          {profile?.role === 'Client' && (
            <div className="card">
              <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 className="card-title">Progress</h3>
              </div>

              <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                {!gamification ? (
                  <div className="alert alert-warning">
                    <span className="alert-icon">{Icons.warning}</span>
                    <span>Gamification data not available yet.</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-color)' }}>
                          Level {levelProgress?.level ?? 1}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                          XP: {levelProgress?.xp ?? 0}
                        </div>
                      </div>

                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                        {levelProgress?.intoLevel ?? 0} / {levelProgress?.neededThisLevel ?? 0} XP to next level
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--stone-100)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: 'var(--space-6)'
                    }}>
                      <div style={{
                        width: `${levelProgress?.pct ?? 0}%`,
                        height: '100%',
                        background: 'var(--primary-color)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* Achievements */}
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <h4 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)', color: 'var(--text-secondary)' }}>Achievements</h4>

                      {(!gamification.achievements || gamification.achievements.length === 0) ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                          No achievements yet. Complete bookings to unlock badges.
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: 'var(--space-3)'
                        }}>
                          {gamification.achievements.map((a) => (
                            <div key={a.code} style={{
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-md)',
                              padding: 'var(--space-3)',
                              background: 'var(--stone-50)',
                              display: 'flex',
                              gap: 'var(--space-3)',
                              alignItems: 'flex-start'
                            }}>
                              <div style={{ width: '24px', height: '24px', color: 'var(--primary-color)', flexShrink: 0 }}>
                                {Icons.award}
                              </div>
                              <div>
                                <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{a.name}</div>
                                {a.description && (
                                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                                    {a.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Entrepreneur company info */}
          {profile?.entrepreneurProfile && (
            <div className="company-card card">
              <div className="card-header">
                <h3 className="card-title">Company Information</h3>
                <span className={`status-badge ${profile.entrepreneurProfile.isApproved ? 'status-approved' : 'status-pending'}`}>
                  {profile.entrepreneurProfile.isApproved ? (
                    <><span className="status-icon">{Icons.check}</span> Approved</>
                  ) : (
                    <><span className="status-icon">{Icons.clock}</span> Pending</>
                  )}
                </span>
              </div>

              <div className="card-body">
                <div className="detail-row">
                  <span className="detail-label">Company Name</span>
                  <span className="detail-value">{profile.entrepreneurProfile.companyName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">CUI (Tax ID)</span>
                  <span className="detail-value">{profile.entrepreneurProfile.cui}</span>
                </div>
              </div>

              {!profile.entrepreneurProfile.isApproved && (
                <div className="pending-notice">
                  <span className="notice-icon">{Icons.info}</span>
                  <p>Your company is pending admin approval. You'll be able to offer services once approved.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="card">
            <div className="card-body">
              <h4>Account Actions</h4>
              <div className="action-list">
                <button className="action-btn" onClick={startEditing}>
                  <span className="action-icon">{Icons.edit}</span>
                  <span>Edit Profile</span>
                </button>
                <button className="action-btn" onClick={startEditing}>
                  <span className="action-icon">{Icons.lock}</span>
                  <span>Change Password</span>
                </button>
                <button className="action-btn" onClick={startEditing}>
                  <span className="action-icon">{Icons.mail}</span>
                  <span>Update Email</span>
                </button>
                {profile?.role !== 'Admin' && (
                  <button className="action-btn danger" onClick={() => setShowDeleteModal(true)}>
                    <span className="action-icon">{Icons.trash}</span>
                    <span>Delete Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4>Quick Stats</h4>

              {profile?.role === 'Entrepreneur' && (
                <div className="stat-list">
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Services</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Bookings</span>
                  </div>
                </div>
              )}

              {profile?.role === 'Client' && (
                <div className="stat-list">
                  <div className="stat-item">
                    <span className="stat-value">{gamification?.totalBookingsCompleted ?? 0}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{gamification?.totalBookingsCreated ?? 0}</span>
                    <span className="stat-label">Created</span>
                  </div>
                </div>
              )}

              {profile?.role === 'Admin' && (
                <div className="stat-list">
                  <div className="stat-item">
                    <span className="stat-value">∞</span>
                    <span className="stat-label">Power</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>{Icons.close}</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">{Icons.warning}</span>
                <div>
                  <h4>This action is permanent</h4>
                  <p>Deleting your account will permanently remove all your data, including bookings, reviews, and profile information. This cannot be undone.</p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Enter your password to confirm</label>
                <input
                  type="password"
                  className="form-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}>
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
