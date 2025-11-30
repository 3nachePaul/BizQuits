import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      // Fallback to auth context data
      if (authUser) {
        setProfile({
          email: authUser.email,
          role: authUser.role
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return '👑';
      case 'Entrepreneur': return '💼';
      case 'Client': return '👤';
      default: return '👤';
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

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-main">
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
            </div>
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
          </div>

          {profile?.entrepreneurProfile && (
            <div className="company-card card">
              <div className="card-header">
                <h3 className="card-title">Company Information</h3>
                <span className={`status-badge ${profile.entrepreneurProfile.isApproved ? 'status-approved' : 'status-pending'}`}>
                  {profile.entrepreneurProfile.isApproved ? '✓ Approved' : '⏳ Pending'}
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
                  <span className="notice-icon">ℹ️</span>
                  <p>Your company is pending admin approval. You'll be able to offer services once approved.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-sidebar">
          <div className="card">
            <div className="card-body">
              <h4>Account Actions</h4>
              <div className="action-list">
                <button className="action-btn" disabled>
                  <span className="action-icon">🔒</span>
                  <span>Change Password</span>
                </button>
                <button className="action-btn" disabled>
                  <span className="action-icon">📧</span>
                  <span>Update Email</span>
                </button>
                <button className="action-btn" disabled>
                  <span className="action-icon">🔔</span>
                  <span>Notification Settings</span>
                </button>
              </div>
              <p className="coming-soon">More features coming soon</p>
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
                    <span className="stat-value">0</span>
                    <span className="stat-label">Bookings</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">$0</span>
                    <span className="stat-label">Spent</span>
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
    </div>
  );
};

export default Profile;