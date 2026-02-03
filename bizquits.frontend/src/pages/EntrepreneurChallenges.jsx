import { useState, useEffect } from 'react';
import { challengeApi } from '../services/api';
import { useToast } from '../components/Toast';
import './EntrepreneurChallenges.css';

// SVG Icons (same as ClientChallenges)
const Icons = {
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
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
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v10H4V12M22 7v5H2V7M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  loader: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
};

const CHALLENGE_TYPES = [
  { value: 0, name: 'BookingMilestone', label: 'Booking Milestone', icon: Icons.trophy },
  { value: 1, name: 'ReviewChallenge', label: 'Review Challenge', icon: Icons.star },
  { value: 2, name: 'SpeedChallenge', label: 'Speed Challenge', icon: Icons.zap },
  { value: 3, name: 'LoyaltyChallenge', label: 'Loyalty Challenge', icon: Icons.award },
  { value: 4, name: 'ReferralChallenge', label: 'Referral Challenge', icon: Icons.users },
  { value: 5, name: 'SeasonalChallenge', label: 'Seasonal Challenge', icon: Icons.calendar }
];

const STATUS_LABELS = {
  Draft: { label: 'Draft', color: 'secondary' },
  Active: { label: 'Active', color: 'success' },
  Completed: { label: 'Completed', color: 'info' },
  Cancelled: { label: 'Cancelled', color: 'danger' }
};

const PARTICIPATION_STATUS = {
  Pending: { label: 'Pending', color: 'warning' },
  Accepted: { label: 'Accepted', color: 'info' },
  Rejected: { label: 'Rejected', color: 'danger' },
  InProgress: { label: 'In Progress', color: 'primary' },
  Completed: { label: 'Completed', color: 'success' },
  Failed: { label: 'Failed', color: 'danger' },
  Withdrawn: { label: 'Withdrawn', color: 'secondary' }
};

export default function EntrepreneurChallenges() {
  const toast = useToast();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formMode, setFormMode] = useState(null); // 'create' | 'edit'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 0,
    targetCount: '',
    timeLimitDays: '',
    xpReward: 50,
    badgeCode: '',
    rewardDescription: '',
    bonusValue: '',
    startDate: '',
    endDate: '',
    maxParticipants: ''
  });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const res = await challengeApi.getMyChallenges();
      setChallenges(res.data);
    } catch (err) {
      toast.error('Could not load challenges.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (challengeId) => {
    try {
      setLoadingParticipants(true);
      const res = await challengeApi.getParticipants(challengeId);
      setParticipants(res.data);
    } catch (err) {
      toast.error('Could not load participants.');
      console.error(err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openCreateForm = () => {
    setFormMode('create');
    setFormData({
      title: '',
      description: '',
      type: 0,
      targetCount: '',
      timeLimitDays: '',
      xpReward: 50,
      badgeCode: '',
      rewardDescription: '',
      bonusValue: '',
      startDate: '',
      endDate: '',
      maxParticipants: ''
    });
    setShowModal(true);
  };

  const openEditForm = (challenge) => {
    setFormMode('edit');
    setSelectedChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      type: CHALLENGE_TYPES.findIndex(t => t.name === challenge.type) || 0,
      targetCount: challenge.targetCount || '',
      timeLimitDays: challenge.timeLimitDays || '',
      xpReward: challenge.xpReward || 50,
      badgeCode: challenge.badgeCode || '',
      rewardDescription: challenge.rewardDescription || '',
      bonusValue: challenge.bonusValue || '',
      startDate: challenge.startDate ? challenge.startDate.split('T')[0] : '',
      endDate: challenge.endDate ? challenge.endDate.split('T')[0] : '',
      maxParticipants: challenge.maxParticipants || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormMode(null);
  };

  const viewParticipants = (challenge) => {
    setSelectedChallenge(challenge);
    loadParticipants(challenge.id);
    setActiveTab('participants');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        targetCount: formData.targetCount ? parseInt(formData.targetCount) : null,
        timeLimitDays: formData.timeLimitDays ? parseInt(formData.timeLimitDays) : null,
        xpReward: formData.xpReward || 50,
        badgeCode: formData.badgeCode.trim() || null,
        rewardDescription: formData.rewardDescription.trim() || null,
        bonusValue: formData.bonusValue ? parseFloat(formData.bonusValue) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
      };

      if (formMode === 'create') {
        await challengeApi.create(payload);
        toast.success('Challenge created as draft!');
      } else {
        await challengeApi.update(selectedChallenge.id, payload);
        toast.success('Challenge updated!');
      }

      await loadChallenges();
      closeModal();
    } catch (err) {
      const msg = err.response?.data || 'Error saving challenge';
      toast.error(typeof msg === 'string' ? msg : 'Error saving challenge');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      setActionLoading(id);
      await challengeApi.activate(id);
      toast.success('Challenge activated!');
      await loadChallenges();
    } catch (err) {
      toast.error('Error activating challenge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      setActionLoading(id);
      await challengeApi.delete(id);
      toast.success('Challenge deleted!');
      await loadChallenges();
    } catch (err) {
      const msg = err.response?.data || 'Error deleting challenge';
      toast.error(typeof msg === 'string' ? msg : 'Error deleting challenge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespondParticipation = async (participationId, accept) => {
    const response = accept ? '' : prompt('Reason for rejection (optional):');
    if (!accept && response === null) return; // User cancelled

    try {
      setActionLoading(participationId);
      await challengeApi.respondParticipation(participationId, { accept, response });
      toast.success(accept ? 'Participation accepted!' : 'Participation rejected.');
      if (selectedChallenge) {
        await loadParticipants(selectedChallenge.id);
      }
    } catch (err) {
      toast.error('Error responding to participation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProgress = async (participationId, markCompleted = false) => {
    const progress = markCompleted ? null : prompt('Enter new progress value:');
    if (!markCompleted && (progress === null || progress === '')) return;

    try {
      setActionLoading(participationId);
      await challengeApi.updateProgress(participationId, {
        progress: progress ? parseInt(progress) : null,
        markCompleted
      });
      toast.success(markCompleted ? 'Challenge completed! Rewards awarded.' : 'Progress updated!');
      if (selectedChallenge) {
        await loadParticipants(selectedChallenge.id);
      }
    } catch (err) {
      toast.error('Error updating progress');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkFailed = async (participationId) => {
    if (!confirm('Mark this participation as failed?')) return;

    try {
      setActionLoading(participationId);
      await challengeApi.markFailed(participationId);
      toast.success('Participation marked as failed.');
      if (selectedChallenge) {
        await loadParticipants(selectedChallenge.id);
      }
    } catch (err) {
      toast.error('Error marking participation as failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="entrepreneur-challenges-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="entrepreneur-challenges-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">{Icons.flag}</span>
            My Challenges
          </h1>
          <p>Create challenges for clients and manage participants</p>
        </div>
        <button className="btn-create" onClick={openCreateForm}>
          <span className="btn-icon">{Icons.plus}</span>
          New Challenge
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <span className="tab-icon">{Icons.flag}</span>
          Challenges
          <span className="badge">{challenges.length}</span>
        </button>
        {activeTab === 'participants' && selectedChallenge && (
          <button className="tab-btn active">
            <span className="tab-icon">{Icons.users}</span>
            Participants
          </button>
        )}
      </div>

      {/* Challenge List */}
      {activeTab === 'list' && (
        <div className="challenges-list">
          {challenges.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.flag}</div>
              <h3>No challenges yet</h3>
              <p>Create your first challenge to engage clients!</p>
              <button className="btn-create" onClick={openCreateForm}>
                <span className="btn-icon">{Icons.plus}</span>
                Create Challenge
              </button>
            </div>
          ) : (
            <div className="challenges-grid">
              {challenges.map((challenge) => {
                const typeInfo = CHALLENGE_TYPES.find(t => t.name === challenge.type) || CHALLENGE_TYPES[0];
                const statusInfo = STATUS_LABELS[challenge.status] || STATUS_LABELS.Draft;

                return (
                  <div key={challenge.id} className={`challenge-card status-${statusInfo.color}`}>
                    <div className="card-header">
                      <div className="type-badge">
                        <span className="type-icon">{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>
                      <span className={`status-badge ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="card-body">
                      <h3>{challenge.title}</h3>
                      <p className="description">{challenge.description}</p>

                      <div className="challenge-stats">
                        {challenge.xpReward > 0 && (
                          <div className="stat">
                            <span className="stat-icon">{Icons.sparkles}</span>
                            <span>+{challenge.xpReward} XP</span>
                          </div>
                        )}
                        {challenge.targetCount && (
                          <div className="stat">
                            <span className="stat-icon">{Icons.target}</span>
                            <span>Target: {challenge.targetCount}</span>
                          </div>
                        )}
                        <div className="stat">
                          <span className="stat-icon">{Icons.users}</span>
                          <span>{challenge.participantsCount} participants</span>
                        </div>
                        {challenge.pendingCount > 0 && (
                          <div className="stat pending">
                            <span className="stat-icon">{Icons.clock}</span>
                            <span>{challenge.pendingCount} pending</span>
                          </div>
                        )}
                      </div>

                      {(challenge.startDate || challenge.endDate) && (
                        <div className="date-range">
                          <span className="date-icon">{Icons.calendar}</span>
                          <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                        </div>
                      )}
                    </div>

                    <div className="card-actions">
                      {challenge.status === 'Draft' && (
                        <button
                          className="btn-activate"
                          onClick={() => handleActivate(challenge.id)}
                          disabled={actionLoading === challenge.id}
                        >
                          <span className="btn-icon">{Icons.play}</span>
                          Activate
                        </button>
                      )}
                      <button
                        className="btn-participants"
                        onClick={() => viewParticipants(challenge)}
                      >
                        <span className="btn-icon">{Icons.users}</span>
                        Participants
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => openEditForm(challenge)}
                      >
                        <span className="btn-icon">{Icons.edit}</span>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(challenge.id)}
                        disabled={actionLoading === challenge.id}
                      >
                        <span className="btn-icon">{Icons.trash}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Challenge Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formMode === 'create' ? 'Create New Challenge' : 'Edit Challenge'}</h2>
              <button className="btn-close" onClick={closeModal}>
                {Icons.x}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Challenge title"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the challenge..."
                  maxLength={2000}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Challenge Type</label>
                <div className="challenge-type-grid">
                  {CHALLENGE_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`challenge-type-card ${formData.type === type.value ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-label">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="xpReward">XP Reward</label>
                  <input
                    type="number"
                    id="xpReward"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={10000}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="targetCount">Target Count</label>
                  <input
                    type="number"
                    id="targetCount"
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                    placeholder="e.g., 5 bookings"
                    min={1}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="timeLimitDays">Time Limit (days)</label>
                  <input
                    type="number"
                    id="timeLimitDays"
                    value={formData.timeLimitDays}
                    onChange={(e) => setFormData({ ...formData, timeLimitDays: e.target.value })}
                    placeholder="Days to complete"
                    min={1}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bonusValue">Bonus Value (RON)</label>
                  <input
                    type="number"
                    id="bonusValue"
                    value={formData.bonusValue}
                    onChange={(e) => setFormData({ ...formData, bonusValue: e.target.value })}
                    placeholder="Optional bonus"
                    step="0.01"
                    min={0}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="badgeCode">Badge Code</label>
                  <input
                    type="text"
                    id="badgeCode"
                    value={formData.badgeCode}
                    onChange={(e) => setFormData({ ...formData, badgeCode: e.target.value })}
                    placeholder="Achievement code"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="rewardDescription">Reward Description</label>
                <input
                  type="text"
                  id="rewardDescription"
                  value={formData.rewardDescription}
                  onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
                  placeholder="What will the participant receive?"
                  maxLength={500}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="btn-icon animate-spin">{Icons.loader}</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">{Icons.check}</span>
                      {formMode === 'create' ? 'Create Challenge' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants View */}
      {activeTab === 'participants' && selectedChallenge && (
        <div className="participants-container">
          <div className="participants-header">
            <button className="btn-back" onClick={() => setActiveTab('list')}>
              Back to Challenges
            </button>
            <h2>{selectedChallenge.title} - Participants</h2>
          </div>

          {loadingParticipants ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.users}</div>
              <h3>No participants yet</h3>
              <p>Participants will appear here when they join this challenge.</p>
            </div>
          ) : (
            <div className="participants-list">
              {participants.map((p) => {
                const statusInfo = PARTICIPATION_STATUS[p.status] || PARTICIPATION_STATUS.Pending;
                const canRespond = p.status === 'Pending';
                const canUpdateProgress = p.status === 'Accepted' || p.status === 'InProgress';

                return (
                  <div key={p.id} className={`participant-card status-${statusInfo.color}`}>
                    <div className="participant-header">
                      <div className="participant-info">
                        <span className="email">{p.user?.email}</span>
                        <span className={`status-badge ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className="join-date">
                        Joined: {formatDate(p.createdAt)}
                      </span>
                    </div>

                    <div className="participant-body">
                      {p.userMessage && (
                        <div className="message-section">
                          <span className="label">Message:</span>
                          <p>{p.userMessage}</p>
                        </div>
                      )}

                      {selectedChallenge.targetCount && p.status !== 'Pending' && p.status !== 'Rejected' && (
                        <div className="progress-section">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span>{p.currentProgress} / {selectedChallenge.targetCount}</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.min(100, (p.currentProgress / selectedChallenge.targetCount) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {p.deadline && (
                        <div className="deadline">
                          <span className="deadline-icon">{Icons.clock}</span>
                          <span>Deadline: {formatDate(p.deadline)}</span>
                        </div>
                      )}

                      {p.rewardAwarded && (
                        <div className="reward-awarded">
                          <span className="reward-icon">{Icons.sparkles}</span>
                          <span>+{p.xpAwarded} XP awarded!</span>
                        </div>
                      )}

                      {p.entrepreneurResponse && (
                        <div className="response-section">
                          <span className="label">Your response:</span>
                          <p>{p.entrepreneurResponse}</p>
                        </div>
                      )}
                    </div>

                    <div className="participant-actions">
                      {canRespond && (
                        <>
                          <button
                            className="btn-accept"
                            onClick={() => handleRespondParticipation(p.id, true)}
                            disabled={actionLoading === p.id}
                          >
                            <span className="btn-icon">{Icons.check}</span>
                            Accept
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleRespondParticipation(p.id, false)}
                            disabled={actionLoading === p.id}
                          >
                            <span className="btn-icon">{Icons.x}</span>
                            Reject
                          </button>
                        </>
                      )}
                      {canUpdateProgress && (
                        <>
                          <button
                            className="btn-progress"
                            onClick={() => handleUpdateProgress(p.id)}
                            disabled={actionLoading === p.id}
                          >
                            Update Progress
                          </button>
                          <button
                            className="btn-complete"
                            onClick={() => handleUpdateProgress(p.id, true)}
                            disabled={actionLoading === p.id}
                          >
                            <span className="btn-icon">{Icons.trophy}</span>
                            Complete
                          </button>
                          <button
                            className="btn-fail"
                            onClick={() => handleMarkFailed(p.id)}
                            disabled={actionLoading === p.id}
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
