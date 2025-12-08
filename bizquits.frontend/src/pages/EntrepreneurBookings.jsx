import { useState, useEffect, useRef } from 'react';
import { bookingApi } from '../services/api';
import { useToast } from '../components/Toast';
import './ClientBookings.css';

function EntrepreneurBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [responseModal, setResponseModal] = useState(null);
  const [responseText, setResponseText] = useState('');
  const toast = useToast();
  const hasFetched = useRef(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getEntrepreneurBookings();
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
    { value: 'all', label: 'All Requests' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Accepted': return '✓';
      case 'InProgress': return '🔄';
      case 'Completed': return '✅';
      case 'Rejected': return '❌';
      case 'Cancelled': return '🚫';
      default: return '📋';
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

  const handleStatusChange = async (bookingId, newStatus, response = '') => {
    setActionLoading(bookingId);
    try {
      await bookingApi.updateStatus(bookingId, newStatus, response);
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
      fetchBookings();
      setResponseModal(null);
      setResponseText('');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const openResponseModal = (booking, status) => {
    setResponseModal({ booking, status });
    setResponseText('');
  };

  if (loading) {
    return <div className="loading-state">Loading booking requests...</div>;
  }

  return (
    <div className="client-bookings-container">
      <div className="page-header">
        <h1>Booking Requests</h1>
        <p>Manage incoming booking requests from clients</p>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{bookings.filter(b => b.status === 'Pending').length}</div>
          <div className="stat-label">Awaiting Response</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bookings.filter(b => b.status === 'InProgress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bookings.filter(b => b.status === 'Completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
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

      {filteredBookings.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📋</div>
          <h3>No booking requests</h3>
          <p>{filter === 'all' ? "You haven't received any booking requests yet" : `No ${filter.toLowerCase()} requests`}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className={`booking-card card status-${booking.status.toLowerCase()}`}>
              <div className="booking-main">
                <div className="booking-header">
                  <div className="service-info">
                    <span className="service-category">{booking.service.category}</span>
                    <h3 className="service-name">{booking.service.name}</h3>
                  </div>
                  <div className={`booking-status status-badge-${booking.status.toLowerCase()}`}>
                    <span className="status-icon">{getStatusIcon(booking.status)}</span>
                    {booking.status === 'InProgress' ? 'In Progress' : booking.status}
                  </div>
                </div>

                <div className="entrepreneur-row">
                  <span className="entrepreneur-avatar">👤</span>
                  <div className="entrepreneur-details">
                    <span className="entrepreneur-name">Client #{booking.client.id}</span>
                    <span className="entrepreneur-email">{booking.client.email}</span>
                  </div>
                </div>

                {booking.message && (
                  <div className="booking-message">
                    <span className="message-label">Client message:</span>
                    <p>{booking.message}</p>
                  </div>
                )}

                {booking.entrepreneurResponse && (
                  <div className="booking-response">
                    <span className="response-label">Your response:</span>
                    <p>{booking.entrepreneurResponse}</p>
                  </div>
                )}

                <div className="booking-dates">
                  <div className="date-item">
                    <span className="date-label">Requested</span>
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
                
                {booking.status === 'Pending' && (
                  <>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => openResponseModal(booking, 'Accepted')}
                      disabled={actionLoading === booking.id}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => openResponseModal(booking, 'Rejected')}
                      disabled={actionLoading === booking.id}
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {booking.status === 'Accepted' && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStatusChange(booking.id, 'InProgress')}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? 'Starting...' : 'Start Work'}
                  </button>
                )}
                
                {booking.status === 'InProgress' && (
                  <span className="status-info">Waiting for client to confirm completion</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal for Accept/Reject */}
      {responseModal && (
        <div className="modal-overlay" onClick={() => setResponseModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{responseModal.status === 'Accepted' ? 'Accept' : 'Reject'} Booking</h2>
              <button className="modal-close" onClick={() => setResponseModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Service: {responseModal.booking.service.name}</h4>
                <p>Client message: {responseModal.booking.message || 'No message'}</p>
              </div>
              <div className="booking-message-field">
                <label htmlFor="response">Response to client (optional)</label>
                <textarea
                  id="response"
                  placeholder={responseModal.status === 'Accepted' 
                    ? "Thank you for your booking! I'll start working on it soon..." 
                    : "Sorry, I cannot take this booking at this time..."
                  }
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setResponseModal(null)}>
                Cancel
              </button>
              <button 
                className={`btn ${responseModal.status === 'Accepted' ? 'btn-primary' : 'btn-danger'}`}
                onClick={() => handleStatusChange(responseModal.booking.id, responseModal.status, responseText)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Confirm ${responseModal.status === 'Accepted' ? 'Accept' : 'Reject'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
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
                <h4>Client</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedBooking.client.email}</span>
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
                    <span className="detail-label">Requested</span>
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
                  <h4>Client Message</h4>
                  <p className="detail-message">{selectedBooking.message}</p>
                </div>
              )}
              {selectedBooking.entrepreneurResponse && (
                <div className="detail-section">
                  <h4>Your Response</h4>
                  <p className="detail-message">{selectedBooking.entrepreneurResponse}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntrepreneurBookings;
