import { useState, useEffect } from 'react';
import './ClientBookings.css';

function ClientBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setTimeout(() => {
      setBookings([
        {
          id: 1,
          service: {
            name: 'Website Development',
            category: 'Development',
            price: 500
          },
          entrepreneur: {
            name: 'Tech Solutions LLC',
            avatar: '💻',
            email: 'contact@techsolutions.com'
          },
          status: 'in-progress',
          bookedDate: '2024-01-15',
          startDate: '2024-01-20',
          estimatedCompletion: '2024-02-03',
          progress: 65
        },
        {
          id: 2,
          service: {
            name: 'Logo Design',
            category: 'Design',
            price: 150
          },
          entrepreneur: {
            name: 'Creative Studio',
            avatar: '🎨',
            email: 'hello@creativestudio.com'
          },
          status: 'completed',
          bookedDate: '2024-01-10',
          startDate: '2024-01-12',
          completedDate: '2024-01-15',
          progress: 100
        },
        {
          id: 3,
          service: {
            name: 'SEO Optimization',
            category: 'Marketing',
            price: 200
          },
          entrepreneur: {
            name: 'Digital Growth Co',
            avatar: '📈',
            email: 'team@digitalgrowth.com'
          },
          status: 'pending',
          bookedDate: '2024-01-18',
          startDate: null,
          estimatedCompletion: null,
          progress: 0
        },
        {
          id: 4,
          service: {
            name: 'Business Consulting',
            category: 'Consulting',
            price: 300
          },
          entrepreneur: {
            name: 'BizGrowth Partners',
            avatar: '💼',
            email: 'info@bizgrowth.com'
          },
          status: 'cancelled',
          bookedDate: '2024-01-05',
          cancelledDate: '2024-01-08',
          cancelReason: 'Schedule conflict',
          progress: 0
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const filters = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '🔄';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
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

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: 'cancelled', cancelledDate: new Date().toISOString().split('T')[0] }
            : b
        )
      );
    }
  };

  if (loading) {
    return <div className="loading-state">Loading bookings...</div>;
  }

  return (
    <div className="client-bookings-container">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Track and manage your service bookings</p>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bookings.filter(b => b.status === 'in-progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bookings.filter(b => b.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${bookings.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + b.service.price, 0)}
          </div>
          <div className="stat-label">Total Spent</div>
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
          <h3>No bookings found</h3>
          <p>{filter === 'all' ? "You haven't made any bookings yet" : `No ${filter} bookings`}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className={`booking-card card status-${booking.status}`}>
              <div className="booking-main">
                <div className="booking-header">
                  <div className="service-info">
                    <span className="service-category">{booking.service.category}</span>
                    <h3 className="service-name">{booking.service.name}</h3>
                  </div>
                  <div className={`booking-status status-badge-${booking.status}`}>
                    <span className="status-icon">{getStatusIcon(booking.status)}</span>
                    {booking.status.replace('-', ' ')}
                  </div>
                </div>

                <div className="entrepreneur-row">
                  <span className="entrepreneur-avatar">{booking.entrepreneur.avatar}</span>
                  <div className="entrepreneur-details">
                    <span className="entrepreneur-name">{booking.entrepreneur.name}</span>
                    <span className="entrepreneur-email">{booking.entrepreneur.email}</span>
                  </div>
                </div>

                {booking.status === 'in-progress' && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span className="progress-percent">{booking.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${booking.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="booking-dates">
                  <div className="date-item">
                    <span className="date-label">Booked</span>
                    <span className="date-value">{formatDate(booking.bookedDate)}</span>
                  </div>
                  {booking.status === 'completed' ? (
                    <div className="date-item">
                      <span className="date-label">Completed</span>
                      <span className="date-value">{formatDate(booking.completedDate)}</span>
                    </div>
                  ) : booking.status === 'cancelled' ? (
                    <div className="date-item">
                      <span className="date-label">Cancelled</span>
                      <span className="date-value">{formatDate(booking.cancelledDate)}</span>
                    </div>
                  ) : (
                    <div className="date-item">
                      <span className="date-label">Est. Completion</span>
                      <span className="date-value">{formatDate(booking.estimatedCompletion)}</span>
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
                {(booking.status === 'pending' || booking.status === 'in-progress') && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel
                  </button>
                )}
                {booking.status === 'completed' && (
                  <button className="btn btn-primary btn-sm">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                </div>
              </div>
              <div className="detail-section">
                <h4>Provider</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{selectedBooking.entrepreneur.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedBooking.entrepreneur.email}</span>
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <h4>Timeline</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`detail-value status-${selectedBooking.status}`}>
                      {getStatusIcon(selectedBooking.status)} {selectedBooking.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Booked Date</span>
                    <span className="detail-value">{formatDate(selectedBooking.bookedDate)}</span>
                  </div>
                  {selectedBooking.startDate && (
                    <div className="detail-item">
                      <span className="detail-label">Start Date</span>
                      <span className="detail-value">{formatDate(selectedBooking.startDate)}</span>
                    </div>
                  )}
                </div>
              </div>
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

export default ClientBookings;
