import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, reviewApi } from '../services/api';
import { useToast } from '../components/Toast';
import BiscuitMascot from '../components/BiscuitMascot';
import './ClientBookings.css';

function ClientBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const toast = useToast();
  const hasFetched = useRef(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (!hasFetched.current) {
        toast.error('Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchBookings();
    }
  }, []);

  const filters = [
    { value: 'all', label: 'All Bookings' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        b.service?.name?.toLowerCase().includes(query) ||
        b.service?.category?.toLowerCase().includes(query) ||
        b.service?.entrepreneurCompanyName?.toLowerCase().includes(query) ||
        b.message?.toLowerCase().includes(query)
      );
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return '';
      case 'Accepted': return '';
      case 'InProgress': return '';
      case 'Completed': return '';
      case 'Rejected': return '';
      case 'Cancelled': return '';
      default: return '';
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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    try {
      await bookingApi.cancel(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking? This cannot be undone.')) return;
    setDeletingId(bookingId);
    try {
      await bookingApi.delete(bookingId);
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Confirm that you have received this service and mark it as completed?')) return;

    setCancellingId(bookingId);
    try {
      await bookingApi.complete(bookingId);
      toast.success('Booking marked as completed!');
      fetchBookings();
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    } finally {
      setCancellingId(null);
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    if (reviewSubmitting) return;
    setReviewBooking(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const submitReview = async () => {
    if (!reviewBooking) return;

    const rating = Number(reviewRating);
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setReviewSubmitting(true);
    try {
      //  Review by BOOKING (Completed)
      await reviewApi.createForBooking(reviewBooking.id, {
        rating,
        comment: reviewComment.trim()
      });

      toast.success('Review submitted! It will appear after admin approval.');
      closeReviewModal();
      // (optional) refresh bookings, în caz că vrei să ascunzi butonul după submit
      fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (value, onChange) => {
    const v = Number(value || 0);
    return (
      <div className="star-row" role="radiogroup" aria-label="Rating">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            className={`star-btn ${s <= v ? 'star-on' : ''}`}
            onClick={() => onChange(s)}
            aria-label={`${s} star`}
          >
            *
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <BiscuitMascot size="lg" />
        <p>Loading your quest log...</p>
      </div>
    );
  }

  return (
    <div className="client-bookings-container">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <div className="page-badge">
              <span className="badge-icon"></span>
              Quest Log
            </div>
            <h1>My Quests</h1>
            <p>Track your adventures and completed missions</p>
          </div>
          <div className="page-header-mascot">
            <BiscuitMascot size="md" />
          </div>
        </div>
      </div>

      <div className="bookings-stats">
        <div className="stat-card stat-card--total">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Quests</div>
          </div>
        </div>
        <div className="stat-card stat-card--pending">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{bookings.filter(b => b.status === 'Pending').length}</div>
            <div className="stat-label">Awaiting</div>
          </div>
        </div>
        <div className="stat-card stat-card--progress">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{bookings.filter(b => b.status === 'InProgress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card stat-card--completed">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{bookings.filter(b => b.status === 'Completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="bookings-toolbar">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filters-bar">
          {filters.map(f => (
            <button
              key={f.value}
              className={`filter-btn ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="filter-count">
                  {bookings.filter(b => b.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <BiscuitMascot size="xl" />
          <h3>No quests found</h3>
          <p>{filter === 'all' ? "You haven't embarked on any quests yet!" : `No ${filter.toLowerCase()} quests`}</p>
          <button className="btn btn-primary" onClick={() => navigate('/services')}>
            Discover Quests
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking, index) => (
            <div 
              key={booking.id} 
              className={`booking-card status-${booking.status.toLowerCase()}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              {...(index === 0 ? { 'data-tour': 'booking-card' } : {})}
            >
              <div className="booking-card-glow"></div>
              <div className="booking-main">
                <div className="booking-header">
                  <div className="service-info">
                    <span className="service-category">{booking.service.category}</span>
                    <h3 className="service-name">{booking.service.name}</h3>
                  </div>
                  <div 
                    className={`booking-status status-badge-${booking.status.toLowerCase()}`}
                    {...(index === 0 ? { 'data-tour': 'booking-status' } : {})}
                  >
                    <span className="status-icon">{getStatusIcon(booking.status)}</span>
                    {booking.status === 'InProgress' ? 'In Progress' : booking.status}
                  </div>
                </div>

                <div className="entrepreneur-row">
                  <span className="entrepreneur-avatar"></span>
                  <div className="entrepreneur-details">
                    <span className="entrepreneur-name">{booking.service.entrepreneurCompanyName || 'N/A'}</span>
                  </div>
                </div>

                {booking.message && (
                  <div className="booking-message">
                    <span className="message-label">Your message:</span>
                    <p>{booking.message}</p>
                  </div>
                )}

                {booking.entrepreneurResponse && (
                  <div className="booking-response">
                    <span className="response-label">Response:</span>
                    <p>{booking.entrepreneurResponse}</p>
                  </div>
                )}

                <div className="booking-dates">
                  <div className="date-item">
                    <span className="date-label">Booked</span>
                    <span className="date-value">{formatDate(booking.createdAt)}</span>
                  </div>
                  {booking.startDate && (
                    <div className="date-item">
                      <span className="date-label">Started</span>
                      <span className="date-value">{formatDate(booking.startDate)}</span>
                    </div>
                  )}
                  {booking.completedDate && (
                    <div className="date-item">
                      <span className="date-label">Completed</span>
                      <span className="date-value">{formatDate(booking.completedDate)}</span>
                    </div>
                  )}
                  <div className="date-item">
                    <span className="date-label">Price</span>
                    <span className="date-value price">${booking.service.price}</span>
                  </div>
                </div>
              </div>

              <div className="booking-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedBooking(booking)}
                >
                  View Details
                </button>

                {/* Chat with Entrepreneur */}
                {['Accepted', 'InProgress', 'Completed'].includes(booking.status) && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/chat?serviceId=${booking.service.id}`)}
                    title="Chat with entrepreneur"
                    {...(index === 0 ? { 'data-tour': 'chat-button' } : {})}
                  >
                    Chat
                  </button>
                )}

                {/*  NEW: Write Review (doar pentru Completed) */}
                {booking.status === 'Completed' && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openReviewModal(booking)}
                  >
                    Write Review
                  </button>
                )}


                {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}

                {(booking.status === 'Pending' || booking.status === 'Rejected' || booking.status === 'Cancelled') && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                    disabled={deletingId === booking.id}
                  >
                    {deletingId === booking.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}

                {booking.status === 'InProgress' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleCompleteBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? 'Completing...' : 'Mark Completed'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Service</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{selectedBooking.service.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{selectedBooking.service.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-value">${selectedBooking.service.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{selectedBooking.service.duration}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Provider</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{selectedBooking.service.entrepreneurCompanyName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Status</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Current Status</span>
                    <span className={`detail-value status-${selectedBooking.status.toLowerCase()}`}>
                      {getStatusIcon(selectedBooking.status)} {selectedBooking.status === 'InProgress' ? 'In Progress' : selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created</span>
                    <span className="detail-value">{formatDate(selectedBooking.createdAt)}</span>
                  </div>
                  {selectedBooking.startDate && (
                    <div className="detail-item">
                      <span className="detail-label">Started</span>
                      <span className="detail-value">{formatDate(selectedBooking.startDate)}</span>
                    </div>
                  )}
                  {selectedBooking.completedDate && (
                    <div className="detail-item">
                      <span className="detail-label">Completed</span>
                      <span className="detail-value">{formatDate(selectedBooking.completedDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.message && (
                <div className="detail-section">
                  <h4>Your Message</h4>
                  <p className="detail-message">{selectedBooking.message}</p>
                </div>
              )}
              {selectedBooking.entrepreneurResponse && (
                <div className="detail-section">
                  <h4>Entrepreneur Response</h4>
                  <p className="detail-message">{selectedBooking.entrepreneurResponse}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedBooking.status === 'Completed' && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedBooking(null);
                    openReviewModal(selectedBooking);
                  }}
                >
                  Write Review
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  REVIEW MODAL */}
      {reviewBooking && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a Review</h2>
              <button className="modal-close" onClick={closeReviewModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Booking</h4>
                <div className="review-booking-title">
                  <div className="review-service-name">{reviewBooking.service?.name}</div>
                  <div className="review-company-name">{reviewBooking.service?.entrepreneurCompanyName}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Rating</h4>
                {renderStars(reviewRating, setReviewRating)}
                <div className="rating-hint">{reviewRating}/5</div>
              </div>

              <div className="detail-section">
                <h4>Review</h4>
                <textarea
                  className="review-textarea"
                  rows={5}
                  placeholder="Write your feedback (min 10 characters)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={reviewSubmitting}
                />
                <div className="review-note">
                  Your review will be visible after admin approval.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeReviewModal} disabled={reviewSubmitting}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={submitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientBookings;
