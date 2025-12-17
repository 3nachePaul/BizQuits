import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, gamificationApi } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <span className="alert-icon">⚠️</span>
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

          {/* Client Gamification */}
          {profile?.role === 'Client' && (
            <div className="card">
              <div className="card-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="card-title">Progress</h3>
              </div>

              <div className="card-body" style={{ padding: '1.5rem' }}>
                {!gamification ? (
                  <div className="alert alert-warning">
                    <span className="alert-icon">⚠️</span>
                    <span>Gamification data not available yet.</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                          Level {levelProgress?.level ?? 1}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          XP: {levelProgress?.xp ?? 0}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {levelProgress?.intoLevel ?? 0} / {levelProgress?.neededThisLevel ?? 0} XP to next level
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      width: '100%',
                      height: '12px',
                      background: 'var(--secondary-color)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: `${levelProgress?.pct ?? 0}%`,
                        height: '100%',
                        background: 'var(--primary-color)',
                      }} />
                    </div>

                    {/* Achievements */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0' }}>Achievements</h4>

                      {(!gamification.achievements || gamification.achievements.length === 0) ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No achievements yet. Complete bookings to unlock badges.
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: '0.75rem'
                        }}>
                          {gamification.achievements.map((a) => (
                            <div key={a.code} style={{
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--border-radius)',
                              padding: '0.75rem',
                              background: 'var(--secondary-color)',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start'
                            }}>
                              <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                                {a.badgeIcon || '🏅'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.name}</div>
                                {a.description && (
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
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

        {/* Sidebar */}
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
    </div>
  );
};

export default Profile;
