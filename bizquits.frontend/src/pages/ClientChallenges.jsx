import { useState, useEffect } from 'react';
import { challengeApi } from '../services/api';
import { useToast } from '../components/Toast';
import './ClientChallenges.css';

// SVG Icons
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
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v10H4V12M22 7v5H2V7M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  loader: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
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
  )
};

const CHALLENGE_TYPES = {
  BookingMilestone: { label: 'Booking Milestone', icon: Icons.trophy, color: 'var(--sage-600)' },
  ReviewChallenge: { label: 'Review Challenge', icon: Icons.star, color: 'var(--warning)' },
  SpeedChallenge: { label: 'Speed Challenge', icon: Icons.zap, color: 'var(--info)' },
  LoyaltyChallenge: { label: 'Loyalty Challenge', icon: Icons.award, color: 'var(--danger)' },
  ReferralChallenge: { label: 'Referral Challenge', icon: Icons.users, color: 'var(--stone-600)' },
  SeasonalChallenge: { label: 'Seasonal Challenge', icon: Icons.calendar, color: 'var(--success)' },
  OfferClaimChallenge: { label: 'Offer Claim Challenge', icon: Icons.gift, color: 'var(--sage-500)' },
  ProofChallenge: { label: 'Proof Challenge', icon: Icons.target, color: 'var(--stone-500)' }
};

const TRACKING_MODE_INFO = {
  Automatic: { label: 'Auto-tracked', description: 'Progress updates automatically when you complete actions', icon: Icons.zap },
  ManualVerification: { label: 'Proof Required', description: 'Submit proof for verification', icon: Icons.target },
  EntrepreneurManual: { label: 'Manual', description: 'Progress updated by entrepreneur', icon: Icons.building }
};

const STATUS_COLORS = {
  Pending: 'warning',
  Accepted: 'info',
  Rejected: 'danger',
  InProgress: 'primary',
  ProofSubmitted: 'info',
  Completed: 'success',
  Failed: 'danger',
  Withdrawn: 'secondary'
};

export default function ClientChallenges() {
  const toast = useToast();
  const [challenges, setChallenges] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [joiningId, setJoiningId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [joinModal, setJoinModal] = useState({ show: false, challenge: null });
  const [joinMessage, setJoinMessage] = useState('');
  const [proofModal, setProofModal] = useState({ show: false, participation: null });
  const [proofText, setProofText] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [challengesRes, participationsRes] = await Promise.all([
        challengeApi.getAll(),
        challengeApi.getMyParticipations()
      ]);
      setChallenges(challengesRes.data);
      setMyParticipations(participationsRes.data);
    } catch (err) {
      toast.error('Could not load challenges.');
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const openJoinModal = (challenge) => {
    setJoinModal({ show: true, challenge });
    setJoinMessage('');
  };

  const closeJoinModal = () => {
    setJoinModal({ show: false, challenge: null });
    setJoinMessage('');
  };

  const handleJoin = async () => {
    if (!joinModal.challenge) return;

    try {
      setJoiningId(joinModal.challenge.id);
      await challengeApi.join(joinModal.challenge.id, { message: joinMessage });
      toast.success('Successfully joined the challenge!');
      closeJoinModal();
      const participationsRes = await challengeApi.getMyParticipations();
      setMyParticipations(participationsRes.data);
    } catch (err) {
      const message = err.response?.data || 'Error joining challenge';
      toast.error(typeof message === 'string' ? message : 'Error joining challenge');
    } finally {
      setJoiningId(null);
    }
  };

  const handleWithdraw = async (participationId) => {
    if (!confirm('Are you sure you want to withdraw from this challenge?')) return;

    try {
      setWithdrawingId(participationId);
      await challengeApi.withdraw(participationId);
      toast.success('Successfully withdrew from the challenge');
      const participationsRes = await challengeApi.getMyParticipations();
      setMyParticipations(participationsRes.data);
    } catch (err) {
      const message = err.response?.data || 'Error withdrawing from challenge';
      toast.error(typeof message === 'string' ? message : 'Error withdrawing');
    } finally {
      setWithdrawingId(null);
    }
  };

  const openProofModal = (participation) => {
    setProofModal({ show: true, participation });
    setProofText('');
    setProofImageUrl('');
  };

  const closeProofModal = () => {
    setProofModal({ show: false, participation: null });
    setProofText('');
    setProofImageUrl('');
  };

  const handleSubmitProof = async () => {
    if (!proofModal.participation) return;
    if (!proofText.trim() && !proofImageUrl.trim()) {
      toast.error('Please provide proof text or an image URL');
      return;
    }

    try {
      setSubmittingProof(true);
      await challengeApi.submitProof(proofModal.participation.id, {
        proofText: proofText.trim() || null,
        proofImageUrl: proofImageUrl.trim() || null
      });
      toast.success('Proof submitted successfully! Waiting for verification.');
      closeProofModal();
      const participationsRes = await challengeApi.getMyParticipations();
      setMyParticipations(participationsRes.data);
    } catch (err) {
      const message = err.response?.data || 'Error submitting proof';
      toast.error(typeof message === 'string' ? message : 'Error submitting proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const isParticipating = (challengeId) => {
    return myParticipations.some(p =>
      p.challenge?.id === challengeId &&
      !['Withdrawn', 'Rejected', 'Failed'].includes(p.status)
    );
  };

  const getParticipation = (challengeId) => {
    return myParticipations.find(p => p.challenge?.id === challengeId);
  };

  const filteredChallenges = filter === 'all'
    ? challenges
    : challenges.filter(c => c.type === filter);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="client-challenges-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-challenges-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">{Icons.flag}</span>
            Challenges
          </h1>
          <p>Join challenges, complete tasks, and earn rewards!</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <span className="tab-icon">{Icons.search}</span>
          Browse Challenges
          <span className="badge">{challenges.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <span className="tab-icon">{Icons.target}</span>
          My Challenges
          <span className="badge">{myParticipations.length}</span>
        </button>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
              <span className="count">{challenges.length}</span>
            </button>
            {Object.entries(CHALLENGE_TYPES).map(([key, type]) => {
              const count = challenges.filter(c => c.type === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  className={`filter-tab ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  <span className="tab-icon">{type.icon}</span>
                  {type.label}
                  <span className="count">{count}</span>
                </button>
              );
            })}
          </div>

          {filteredChallenges.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.flag}</div>
              <h3>No challenges available</h3>
              <p>Check back later for new challenges!</p>
            </div>
          ) : (
            <div className="challenges-grid">
              {filteredChallenges.map((challenge, index) => {
                const typeInfo = CHALLENGE_TYPES[challenge.type] || { label: challenge.type, icon: Icons.target };
                const participating = isParticipating(challenge.id);
                const participation = getParticipation(challenge.id);

                return (
                  <div key={challenge.id} className={`challenge-card ${participating ? 'participating' : ''}`}
                    {...(index === 0 ? { 'data-tour': 'challenge-card' } : {})}
                  >
                    {participating && (
                      <div className="participating-badge">
                        <span className="badge-icon">{Icons.check}</span>
                        Joined
                      </div>
                    )}

                    <div className="challenge-type-header">
                      <span className="challenge-icon">{typeInfo.icon}</span>
                      <span className="challenge-type-label">{typeInfo.label}</span>
                    </div>

                    <div className="challenge-body">
                      <h3>{challenge.title}</h3>
                      <p className="challenge-description">{challenge.description}</p>

                      <div className="challenge-details">
                        {challenge.targetCount && (
                          <div className="detail-chip">
                            <span className="chip-icon">{Icons.target}</span>
                            Target: {challenge.targetCount}
                          </div>
                        )}
                        {challenge.timeLimitDays && (
                          <div className="detail-chip">
                            <span className="chip-icon">{Icons.clock}</span>
                            {challenge.timeLimitDays} days limit
                          </div>
                        )}
                        {challenge.trackingMode && TRACKING_MODE_INFO[challenge.trackingMode] && (
                          <div className="detail-chip tracking" title={TRACKING_MODE_INFO[challenge.trackingMode].description}>
                            <span className="chip-icon">{TRACKING_MODE_INFO[challenge.trackingMode].icon}</span>
                            {TRACKING_MODE_INFO[challenge.trackingMode].label}
                          </div>
                        )}
                        {challenge.xpReward > 0 && (
                          <div className="detail-chip xp">
                            <span className="chip-icon">{Icons.sparkles}</span>
                            +{challenge.xpReward} XP
                          </div>
                        )}
                        {challenge.coinsReward > 0 && (
                          <div className="detail-chip coins">
                            <span className="chip-icon">{Icons.star}</span>
                            +{challenge.coinsReward} Coins
                          </div>
                        )}
                        {challenge.bonusValue > 0 && (
                          <div className="detail-chip bonus">
                            <span className="chip-icon">{Icons.gift}</span>
                            +{challenge.bonusValue.toFixed(2)} RON bonus
                          </div>
                        )}
                      </div>

                      {challenge.rewardDescription && (
                        <div className="reward-description">
                          <span className="reward-icon">{Icons.gift}</span>
                          <span>{challenge.rewardDescription}</span>
                        </div>
                      )}

                      {participation && (
                        <div className="participation-info">
                          <span className={`status-badge ${STATUS_COLORS[participation.status] || 'secondary'}`}>
                            {participation.status === 'ProofSubmitted' ? 'Proof Submitted' : participation.status}
                          </span>
                          {participation.currentProgress > 0 && (
                            <span className="progress-text">
                              Progress: {participation.currentProgress}
                              {challenge.targetCount && ` / ${challenge.targetCount}`}
                              {participation.progressPercentage !== undefined && ` (${participation.progressPercentage}%)`}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="challenge-footer">
                        <div className="validity">
                          {challenge.startDate && challenge.endDate && (
                            <span className="date-range">
                              <span className="date-icon">{Icons.calendar}</span>
                              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                            </span>
                          )}
                          {!challenge.startDate && !challenge.endDate && (
                            <span className="date-range ongoing">
                              <span className="date-icon">{Icons.clock}</span>
                              Ongoing challenge
                            </span>
                          )}
                        </div>

                        {challenge.entrepreneur && (
                          <div className="entrepreneur-info">
                            <span className="by-text">by</span>
                            <span className="entrepreneur-name">{challenge.entrepreneur.companyName}</span>
                          </div>
                        )}

                        {challenge.participantsCount !== undefined && (
                          <div className="participants-count">
                            <span className="count-icon">{Icons.users}</span>
                            {challenge.participantsCount} participants
                          </div>
                        )}
                      </div>

                      <div className="challenge-actions">
                        {participating ? (
                          <button className="btn-joined" disabled>
                            <span className="btn-icon">{Icons.check}</span>
                            Joined
                          </button>
                        ) : (
                          <button
                            className="btn-join"
                            onClick={() => openJoinModal(challenge)}
                            disabled={joiningId === challenge.id}
                            {...(index === 0 ? { 'data-tour': 'join-button' } : {})}
                          >
                            {joiningId === challenge.id ? (
                              <>
                                <span className="btn-icon animate-spin">{Icons.loader}</span>
                                Joining...
                              </>
                            ) : (
                              <>
                                <span className="btn-icon">{Icons.flag}</span>
                                Join Challenge
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Participations Tab */
        <div className="my-participations-section">
          {myParticipations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.target}</div>
              <h3>No challenges joined yet</h3>
              <p>Browse available challenges and join them!</p>
              <button className="btn-join" onClick={() => setActiveTab('browse')}>
                <span className="btn-icon">{Icons.flag}</span>
                Browse Challenges
              </button>
            </div>
          ) : (
            <div className="participations-grid">
              {myParticipations.map((participation) => {
                const challenge = participation.challenge;
                const typeInfo = challenge ? (CHALLENGE_TYPES[challenge.type] || { label: challenge.type, icon: Icons.target }) : { label: 'Unknown', icon: Icons.target };
                const canWithdraw = ['Pending', 'Accepted', 'InProgress'].includes(participation.status);

                return (
                  <div key={participation.id} className={`participation-card ${participation.status.toLowerCase()}`}>
                    <div className="participation-header">
                      <div className="participation-type">
                        <span className="type-icon">{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>
                      <span className={`status-badge ${STATUS_COLORS[participation.status] || 'secondary'}`}>
                        {participation.status === 'Pending' && <>{Icons.clock} Pending</>}
                        {participation.status === 'Accepted' && <>{Icons.check} Accepted</>}
                        {participation.status === 'Rejected' && <>{Icons.x} Rejected</>}
                        {participation.status === 'InProgress' && <>{Icons.zap} In Progress</>}
                        {participation.status === 'ProofSubmitted' && <>{Icons.clock} Proof Submitted</>}
                        {participation.status === 'Completed' && <>{Icons.trophy} Completed</>}
                        {participation.status === 'Failed' && <>{Icons.x} Failed</>}
                        {participation.status === 'Withdrawn' && <>{Icons.x} Withdrawn</>}
                      </span>
                    </div>

                    <div className="participation-body">
                      <h3>{challenge?.title || 'Challenge'}</h3>
                      {challenge?.description && (
                        <p className="participation-description">{challenge.description}</p>
                      )}

                      {/* Tracking Mode Info */}
                      {challenge?.trackingMode && TRACKING_MODE_INFO[challenge.trackingMode] && (
                        <div className="tracking-mode-info">
                          <span className="tracking-icon">{TRACKING_MODE_INFO[challenge.trackingMode].icon}</span>
                          <span className="tracking-label">{TRACKING_MODE_INFO[challenge.trackingMode].label}</span>
                          <span className="tracking-description">{TRACKING_MODE_INFO[challenge.trackingMode].description}</span>
                        </div>
                      )}

                      {/* Progress */}
                      {challenge?.targetCount && participation.status !== 'Pending' && (
                        <div className="progress-section" data-tour="progress-bar">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span>{participation.currentProgress} / {participation.targetProgress || challenge.targetCount} ({participation.progressPercentage || 0}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${participation.progressPercentage || Math.min(100, (participation.currentProgress / (participation.targetProgress || challenge.targetCount)) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Rewards */}
                      {participation.rewardAwarded && (
                        <div className="rewards-section">
                          <div className="reward-badge">
                            <span className="reward-icon">{Icons.sparkles}</span>
                            <span>+{participation.xpAwarded} XP awarded!</span>
                          </div>
                          {participation.coinsAwarded > 0 && (
                            <div className="reward-badge coins">
                              <span className="reward-icon">{Icons.star}</span>
                              <span>+{participation.coinsAwarded} Coins awarded!</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Proof Instructions for Manual Verification */}
                      {challenge?.trackingMode === 'ManualVerification' && challenge?.proofInstructions && (
                        <div className="proof-instructions">
                          <span className="proof-label">{Icons.target} How to complete:</span>
                          <p>{challenge.proofInstructions}</p>
                        </div>
                      )}

                      {/* Proof Submitted Indicator */}
                      {participation.proofSubmitted && (
                        <div className="proof-submitted-info">
                          <span className="proof-icon">{Icons.check}</span>
                          <span>Proof submitted on {formatDate(participation.proofSubmittedAt)}</span>
                          <span className="waiting">Waiting for verification...</span>
                        </div>
                      )}

                      {/* Entrepreneur Response */}
                      {participation.entrepreneurResponse && (
                        <div className="response-section">
                          <span className="response-label">Response:</span>
                          <p className="response-text">{participation.entrepreneurResponse}</p>
                        </div>
                      )}

                      <div className="participation-meta">
                        <div className="meta-item">
                          <span className="meta-icon">{Icons.calendar}</span>
                          <span>Joined: {formatDate(participation.createdAt)}</span>
                        </div>
                        {participation.deadline && (
                          <div className="meta-item deadline">
                            <span className="meta-icon">{Icons.clock}</span>
                            <span>Deadline: {formatDate(participation.deadline)}</span>
                          </div>
                        )}
                        {participation.completedAt && (
                          <div className="meta-item completed">
                            <span className="meta-icon">{Icons.check}</span>
                            <span>Completed: {formatDate(participation.completedAt)}</span>
                          </div>
                        )}
                        {challenge?.entrepreneur && (
                          <div className="meta-item">
                            <span className="meta-icon">{Icons.building}</span>
                            <span>{challenge.entrepreneur.companyName}</span>
                          </div>
                        )}
                      </div>

                      {(canWithdraw || (challenge?.trackingMode === 'ManualVerification' && ['Accepted', 'InProgress'].includes(participation.status) && !participation.proofSubmitted)) && (
                        <div className="participation-actions">
                          {challenge?.trackingMode === 'ManualVerification' && ['Accepted', 'InProgress'].includes(participation.status) && !participation.proofSubmitted && (
                            <button
                              className="btn-submit-proof"
                              onClick={() => openProofModal(participation)}
                            >
                              <span className="btn-icon">{Icons.target}</span>
                              Submit Proof
                            </button>
                          )}
                          {canWithdraw && (
                            <button
                              className="btn-withdraw"
                              onClick={() => handleWithdraw(participation.id)}
                              disabled={withdrawingId === participation.id}
                            >
                              {withdrawingId === participation.id ? (
                                <>
                                  <span className="btn-icon animate-spin">{Icons.loader}</span>
                                  Withdrawing...
                                </>
                              ) : (
                                <>
                                  <span className="btn-icon">{Icons.x}</span>
                                  Withdraw
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Join Modal */}
      {joinModal.show && joinModal.challenge && (
        <div className="modal-overlay" onClick={closeJoinModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join Challenge</h3>
              <button className="modal-close" onClick={closeJoinModal}>
                {Icons.x}
              </button>
            </div>

            <div className="modal-body">
              <div className="challenge-preview">
                <h4>{joinModal.challenge.title}</h4>
                <p>{joinModal.challenge.description}</p>
                {joinModal.challenge.xpReward > 0 && (
                  <div className="reward-preview">
                    <span className="reward-icon">{Icons.sparkles}</span>
                    <span>+{joinModal.challenge.xpReward} XP on completion</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="joinMessage">Message (optional)</label>
                <textarea
                  id="joinMessage"
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Say something to the entrepreneur..."
                  maxLength={1000}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeJoinModal}>
                Cancel
              </button>
              <button
                className="btn-join"
                onClick={handleJoin}
                disabled={joiningId === joinModal.challenge.id}
              >
                {joiningId === joinModal.challenge.id ? (
                  <>
                    <span className="btn-icon animate-spin">{Icons.loader}</span>
                    Joining...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">{Icons.flag}</span>
                    Join Challenge
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Proof Modal */}
      {proofModal.show && proofModal.participation && (
        <div className="modal-overlay" onClick={closeProofModal}>
          <div className="modal-content proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Proof</h3>
              <button className="modal-close" onClick={closeProofModal}>
                {Icons.x}
              </button>
            </div>

            <div className="modal-body">
              <div className="challenge-preview">
                <h4>{proofModal.participation.challenge?.title}</h4>
                {proofModal.participation.challenge?.proofInstructions && (
                  <div className="proof-instructions-modal">
                    <span className="instruction-label">{Icons.target} Instructions:</span>
                    <p>{proofModal.participation.challenge.proofInstructions}</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="proofText">Describe your proof</label>
                <textarea
                  id="proofText"
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Explain how you completed the challenge..."
                  maxLength={2000}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="proofImageUrl">Image URL (optional)</label>
                <input
                  type="url"
                  id="proofImageUrl"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="https://example.com/proof-image.jpg"
                />
                <small className="form-hint">Paste a link to an image showing proof of completion</small>
              </div>

              {proofImageUrl && (
                <div className="proof-image-preview">
                  <img src={proofImageUrl} alt="Proof preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeProofModal}>
                Cancel
              </button>
              <button
                className="btn-submit-proof"
                onClick={handleSubmitProof}
                disabled={submittingProof || (!proofText.trim() && !proofImageUrl.trim())}
              >
                {submittingProof ? (
                  <>
                    <span className="btn-icon animate-spin">{Icons.loader}</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">{Icons.target}</span>
                    Submit Proof
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
