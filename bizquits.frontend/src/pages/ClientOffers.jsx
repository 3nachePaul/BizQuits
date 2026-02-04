import { useState, useEffect } from 'react';
import { offerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './ClientOffers.css';

// SVG Icons
const Icons = {
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v10H4V12M22 7v5H2V7M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z"/>
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
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2M13 17v2M13 11v2"/>
    </svg>
  ),
  percent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
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
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      <path d="M9 9v.01"/>
      <path d="M9 12v.01"/>
      <path d="M9 15v.01"/>
      <path d="M9 18v.01"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  infinity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  )
};

const OFFER_TYPES = {
  JobMilestone: { label: 'Job Milestone', icon: Icons.trophy, color: 'var(--sage-600)' },
  EarlyCompletion: { label: 'Early Completion', icon: Icons.zap, color: 'var(--info)' },
  Coupon: { label: 'Coupon', icon: Icons.ticket, color: 'var(--danger)' },
  Discount: { label: 'Discount', icon: Icons.percent, color: 'var(--success)' },
  Referral: { label: 'Referral', icon: Icons.users, color: 'var(--stone-600)' },
  LoyaltyReward: { label: 'Loyalty', icon: Icons.heart, color: 'var(--warning)' }
};

export default function ClientOffers() {
  const { user } = useAuth();
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [claimingId, setClaimingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersRes, claimsRes] = await Promise.all([
        offerApi.getAll(),
        offerApi.getMyClaims()
      ]);
      setOffers(offersRes.data.filter(offer => offer.isActive));
      setMyClaims(claimsRes.data);
    } catch (err) {
      setError('Could not load offers.');
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (offerId) => {
    try {
      setClaimingId(offerId);
      await offerApi.claim(offerId);
      toast.success('Offer claimed successfully!');
      const claimsRes = await offerApi.getMyClaims();
      setMyClaims(claimsRes.data);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || 'Error claiming offer';
      toast.error(message);
    } finally {
      setClaimingId(null);
    }
  };

  const handleCancelClaim = async (claimId) => {
    if (!confirm('Are you sure you want to cancel this claim?')) return;
    
    try {
      await offerApi.cancelClaim(claimId);
      toast.success('Claim cancelled');
      const claimsRes = await offerApi.getMyClaims();
      setMyClaims(claimsRes.data);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || 'Error cancelling claim';
      toast.error(message);
    }
  };

  const isOfferClaimed = (offerId) => {
    return myClaims.some(claim => claim.offerId === offerId);
  };

  const getClaimForOffer = (offerId) => {
    return myClaims.find(claim => claim.offerId === offerId);
  };

  const filteredOffers = offers.filter(offer => {
    const matchesFilter = filter === 'all' || offer.type === filter;
    const matchesSearch = searchQuery === '' || 
      offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.entrepreneurCompanyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="client-offers-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-offers-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">{Icons.gift}</span>
            Special Offers
          </h1>
          <p>Discover exclusive offers from our entrepreneurs</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <span className="tab-icon">{Icons.search}</span>
          Browse Offers
          <span className="badge">{offers.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'claimed' ? 'active' : ''}`}
          onClick={() => setActiveTab('claimed')}
        >
          <span className="tab-icon">{Icons.check}</span>
          My Offers
          <span className="badge">{myClaims.length}</span>
        </button>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Search and Filter */}
          <div className="offers-toolbar">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
              <span className="count">{offers.length}</span>
            </button>
            {Object.entries(OFFER_TYPES).map(([key, type]) => {
              const count = offers.filter(o => o.type === key).length;
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

          {filteredOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.gift}</div>
              <h3>No offers available</h3>
              <p>Check back later for exclusive offers!</p>
            </div>
          ) : (
            <div className="offers-grid">
              {filteredOffers.map((offer, index) => {
                const typeInfo = OFFER_TYPES[offer.type] || { label: offer.type, icon: Icons.gift, color: 'var(--sage-600)' };
                const expiringSoon = isExpiringSoon(offer.validUntil);
                const expired = isExpired(offer.validUntil);
                const claimed = isOfferClaimed(offer.id);
                const claim = getClaimForOffer(offer.id);

                return (
                  <div 
                    key={offer.id} 
                    className={`offer-card ${expired ? 'expired' : ''} ${expiringSoon ? 'expiring-soon' : ''} ${claimed ? 'claimed' : ''}`}
                    {...(index === 0 ? { 'data-tour': 'offer-card' } : {})}
                  >
                    {expiringSoon && !expired && (
                      <div className="expiring-badge">
                        <span className="badge-icon">{Icons.clock}</span>
                        Ending Soon!
                      </div>
                    )}
                    {claimed && (
                      <div className="claimed-badge">
                        <span className="badge-icon">{Icons.check}</span>
                        Claimed
                      </div>
                    )}
                    
                    <div className="offer-type-header">
                      <span className="offer-icon">{typeInfo.icon}</span>
                      <span className="offer-type-label">
                        {typeInfo.label}
                      </span>
                    </div>

                    <div className="offer-body">
                      <h3>{offer.title}</h3>
                      <p className="offer-description">{offer.description}</p>

                      {/* Type-specific details */}
                      <div className="offer-details">
                        {offer.type === 'JobMilestone' && offer.milestoneCount && (
                          <div className="detail-chip milestone">
                            <span className="chip-icon">{Icons.target}</span>
                            Complete {offer.milestoneCount} jobs
                          </div>
                        )}

                        {offer.type === 'EarlyCompletion' && offer.earlyCompletionDays && (
                          <div className="detail-chip bonus">
                            <span className="chip-icon">{Icons.sparkles}</span>
                            Bonus for completion {offer.earlyCompletionDays} days early
                          </div>
                        )}

                        {(offer.type === 'Coupon' || offer.type === 'Discount') && (
                          <>
                            {offer.discountPercentage && (
                              <div className="detail-chip discount">
                                <span className="chip-icon">{Icons.percent}</span>
                                {offer.discountPercentage}% OFF
                              </div>
                            )}
                            {offer.bonusValue && (
                              <div className="detail-chip discount">
                                <span className="chip-icon">{Icons.percent}</span>
                                {offer.bonusValue.toFixed(2)} RON OFF
                              </div>
                            )}
                          </>
                        )}

                        {offer.type === 'Referral' && (
                          <div className="detail-chip referral">
                            <span className="chip-icon">{Icons.users}</span>
                            Refer friends and earn rewards
                          </div>
                        )}

                        {offer.type === 'LoyaltyReward' && offer.milestoneCount && (
                          <div className="detail-chip loyalty">
                            <span className="chip-icon">{Icons.star}</span>
                            For clients with {offer.milestoneCount}+ completed jobs
                          </div>
                        )}

                        {offer.rewardDescription && (
                          <div className="reward-description">
                            <span className="reward-icon">{Icons.gift}</span>
                            <span>{offer.rewardDescription}</span>
                          </div>
                        )}
                      </div>

                      {/* Claim code if claimed */}
                      {claimed && claim && (
                        <div className="claim-info">
                          <div className="claim-code-box">
                            <span className="code-label">Your code:</span>
                            <span className="code-value">{claim.claimCode}</span>
                          </div>
                          <p className="claim-date">Claimed: {formatDate(claim.claimedAt)}</p>
                        </div>
                      )}

                      <div className="offer-footer">
                        <div className="validity">
                          {offer.validFrom && (
                            <span className="date-range">
                              <span className="date-icon">{Icons.calendar}</span>
                              {formatDate(offer.validFrom)} - {formatDate(offer.validUntil)}
                            </span>
                          )}
                          {!offer.validFrom && offer.validUntil && (
                            <span className="date-range">
                              <span className="date-icon">{Icons.clock}</span>
                              Valid until {formatDate(offer.validUntil)}
                            </span>
                          )}
                          {!offer.validFrom && !offer.validUntil && (
                            <span className="date-range ongoing">
                              <span className="date-icon">{Icons.infinity}</span>
                              Ongoing offer
                            </span>
                          )}
                        </div>

                        {offer.entrepreneur && (
                          <div className="entrepreneur-info">
                            <span className="by-text">from</span>
                            <span className="entrepreneur-name">{offer.entrepreneur.companyName}</span>
                          </div>
                        )}
                      </div>

                      {/* Claim Button */}
                      <div className="offer-actions">
                        {claimed ? (
                          <button className="btn-claimed" disabled>
                            <span className="btn-icon">{Icons.check}</span>
                            Claimed
                          </button>
                        ) : (
                          <button 
                            className="btn-claim"
                            onClick={() => handleClaim(offer.id)}
                            disabled={claimingId === offer.id || expired}
                            {...(index === 0 ? { 'data-tour': 'claim-button' } : {})}
                          >
                            {claimingId === offer.id ? (
                              <>
                                <span className="btn-icon">{Icons.clock}</span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <span className="btn-icon">{Icons.gift}</span>
                                Claim Offer
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
        /* My Claims Tab */
        <div className="my-claims-section">
          {myClaims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.clipboard}</div>
              <h3>No claimed offers</h3>
              <p>Browse available offers and claim them!</p>
              <button className="btn-claim" onClick={() => setActiveTab('browse')}>
                <span className="btn-icon">{Icons.gift}</span>
                Browse Offers
              </button>
            </div>
          ) : (
            <div className="claims-grid">
              {myClaims.map((claim) => {
                const offer = claim.offer;
                const typeInfo = offer ? (OFFER_TYPES[offer.type] || { label: offer.type, icon: Icons.gift, color: 'var(--sage-600)' }) : { label: 'Unknown', icon: Icons.gift, color: 'var(--sage-600)' };
                
                return (
                  <div key={claim.id} className={`claim-card ${claim.status.toLowerCase()}`}>
                    <div className="claim-header">
                      <div className="claim-type">
                        <span className="type-icon">{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>
                      <span className={`status-badge ${claim.status.toLowerCase()}`}>
                        {claim.status === 'Claimed' && (
                          <><span className="status-icon">{Icons.ticket}</span> Active</>
                        )}
                        {claim.status === 'Used' && (
                          <><span className="status-icon">{Icons.check}</span> Used</>
                        )}
                        {claim.status === 'Expired' && (
                          <><span className="status-icon">{Icons.clock}</span> Expired</>
                        )}
                        {claim.status === 'Cancelled' && (
                          <><span className="status-icon">{Icons.x}</span> Cancelled</>
                        )}
                      </span>
                    </div>

                    <div className="claim-body">
                      <h3>{claim.offerTitle}</h3>
                      
                      {offer && <p className="claim-description">{offer.description}</p>}

                      <div className="claim-code-section">
                        <div className="code-box">
                          <span className="label">Claim Code</span>
                          <span className="code">{claim.claimCode}</span>
                        </div>
                      </div>

                      <div className="claim-meta">
                        <div className="meta-item">
                          <span className="meta-icon">{Icons.calendar}</span>
                          <span className="meta-label">Claimed:</span>
                          <span className="meta-value">{formatDate(claim.claimedAt)}</span>
                        </div>
                        {claim.usedAt && (
                          <div className="meta-item">
                            <span className="meta-icon">{Icons.check}</span>
                            <span className="meta-label">Used:</span>
                            <span className="meta-value">{formatDate(claim.usedAt)}</span>
                          </div>
                        )}
                        {offer?.entrepreneur && (
                          <div className="meta-item">
                            <span className="meta-icon">{Icons.building}</span>
                            <span className="meta-label">From:</span>
                            <span className="meta-value">{offer.entrepreneur.companyName}</span>
                          </div>
                        )}
                      </div>

                      {claim.status === 'Claimed' && (
                        <div className="claim-actions">
                          <button 
                            className="btn-cancel"
                            onClick={() => handleCancelClaim(claim.id)}
                          >
                            <span className="btn-icon">{Icons.x}</span>
                            Cancel Claim
                          </button>
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
    </div>
  );
}
