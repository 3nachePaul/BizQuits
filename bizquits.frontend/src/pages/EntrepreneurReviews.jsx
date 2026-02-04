import { useState, useEffect } from 'react';
import { reviewApi } from '../services/api';
import { useToast } from '../components/Toast';
import './EntrepreneurReviews.css';

// SVG Icons
const Icons = {
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  starOutline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  messageSquare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
};

export default function EntrepreneurReviews() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getMyReviews();
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || null);
    } catch (err) {
      console.error('Error loading reviews:', err);
      toast.error('Could not load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={`star ${s <= rating ? 'filled' : ''}`}>
            {s <= rating ? Icons.star : Icons.starOutline}
          </span>
        ))}
      </div>
    );
  };

  const filteredReviews = reviews
    .filter(r => {
      if (filter === 'approved') return r.isApproved;
      if (filter === 'pending') return !r.isApproved;
      return true;
    })
    .filter(r => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        r.serviceName?.toLowerCase().includes(query) ||
        r.clientEmail?.toLowerCase().includes(query) ||
        r.comment?.toLowerCase().includes(query)
      );
    });

  if (loading) {
    return (
      <div className="entrepreneur-reviews-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="entrepreneur-reviews-container">
      <div className="page-header">
        <h1>My Reviews</h1>
        <p>See what customers are saying about your services</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="reviews-stats-grid">
          <div className="stat-card stat-card--total">
            <div className="stat-icon">{Icons.messageSquare}</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalReviews}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
          <div className="stat-card stat-card--approved">
            <div className="stat-icon">{Icons.check}</div>
            <div className="stat-content">
              <div className="stat-value">{stats.approvedReviews}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
          <div className="stat-card stat-card--pending">
            <div className="stat-icon">{Icons.clock}</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingReviews}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card stat-card--rating">
            <div className="stat-icon">{Icons.star}</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="reviews-toolbar">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({reviews.length})
          </button>
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({reviews.filter(r => r.isApproved).length})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({reviews.filter(r => !r.isApproved).length})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.starOutline}</div>
          <h3>No reviews found</h3>
          <p>{filter === 'all' ? "You haven't received any reviews yet" : `No ${filter} reviews`}</p>
        </div>
      ) : (
        <div className="reviews-list">
          {filteredReviews.map((review) => (
            <div key={review.id} className={`review-card ${!review.isApproved ? 'pending' : ''}`}>
              <div className="review-header">
                <div className="review-service">
                  <span className="service-icon">{Icons.briefcase}</span>
                  <span className="service-name">{review.serviceName}</span>
                </div>
                <div className={`review-status ${review.isApproved ? 'approved' : 'pending'}`}>
                  {review.isApproved ? (
                    <><span className="status-icon">{Icons.check}</span> Approved</>
                  ) : (
                    <><span className="status-icon">{Icons.clock}</span> Pending</>
                  )}
                </div>
              </div>

              <div className="review-rating">
                {renderStars(review.rating)}
                <span className="rating-text">{review.rating}/5</span>
              </div>

              {review.comment && (
                <div className="review-comment">
                  <p>"{review.comment}"</p>
                </div>
              )}

              <div className="review-footer">
                <div className="review-author">
                  <span className="author-icon">{Icons.user}</span>
                  <span>{review.clientEmail}</span>
                </div>
                <div className="review-date">
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
