import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi, bookingApi } from '../services/api';
import { useToast } from '../components/Toast';
import BiscuitMascot from '../components/BiscuitMascot';
import './ClientServices.css';

const Icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  message: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M5 19l1 3 1-3"/>
      <path d="M18 16l1 3 1-3"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  coin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v12"/>
      <path d="M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5 1.5 2.5 3 2.5 3 1 3 2.5-1.5 2.5-3 2.5"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  starEmpty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  )
};

function ClientServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [categories, setCategories] = useState(['all', 'Development', 'Design', 'Marketing', 'Consulting', 'Other']);
  const toast = useToast();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;

      if (priceRange !== 'all') {
        if (priceRange === '0-200') params.maxPrice = 200;
        else if (priceRange === '200-500') {
          params.minPrice = 200;
          params.maxPrice = 500;
        } else if (priceRange === '500+') params.minPrice = 500;
      }

      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await serviceApi.getAll(params);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, priceRange, searchTerm, toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await serviceApi.getCategories();
        if (response.data.length > 0) {
          setCategories(['all', ...response.data]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, priceRange, searchTerm, fetchServices]);

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-200', label: 'Under $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500+', label: '$500+' }
  ];

  const handleBookService = (service) => {
    setSelectedService(service);
    setBookingMessage('');
  };

  const confirmBooking = async () => {
    if (!selectedService) return;

    setBookingLoading(true);
    try {
      await bookingApi.create(selectedService.id, bookingMessage);
      toast.success(`Booking request sent for ${selectedService.name}! The entrepreneur will contact you shortly.`);
      setSelectedService(null);
      setBookingMessage('');
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to create booking';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const openCompanyProfile = (entrepreneurProfileId) => {
    if (!entrepreneurProfileId) {
      toast.error('Company profile id missing.');
      return;
    }
    navigate(`/companies/${entrepreneurProfileId}`);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <BiscuitMascot size="lg" />
        <p>Finding the best quests for you...</p>
      </div>
    );
  }

  return (
    <div className="client-services-container">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <div className="page-badge">
              <span className="badge-icon">{Icons.compass}</span>
              Quest Board
            </div>
            <h1>Discover Quests</h1>
            <p>Find your next adventure and connect with local businesses</p>
          </div>
          <div className="page-header-mascot">
            <BiscuitMascot size="lg" />
          </div>
        </div>
        <div className="page-header-decorations">
          <span className="deco deco-coin">{Icons.coin}</span>
          <span className="deco deco-star">{Icons.star}</span>
          <span className="deco deco-sparkle">{Icons.sparkle}</span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <span className="filters-icon">{Icons.filter}</span>
          <span>Refine Your Quest</span>
        </div>
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search quests, entrepreneurs, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div className="filter-group" data-tour="categories">
            <label>Category</label>
            <div className="filter-pills">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Reward Range</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="results-info">
        <span className="results-count">{services.length}</span>
        <span>quest{services.length !== 1 ? 's' : ''} available</span>
        {selectedCategory !== 'all' && (
          <span className="results-filter-tag">
            in {selectedCategory}
            <button onClick={() => setSelectedCategory('all')}>×</button>
          </span>
        )}
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <BiscuitMascot size="xl" />
          <h3>No quests found</h3>
          <p>Try adjusting your filters or check back later for new adventures!</p>
          <button className="btn btn-primary" onClick={() => { setSelectedCategory('all'); setPriceRange('all'); setSearchTerm(''); }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="service-card"
              style={{ animationDelay: `${index * 0.05}s` }}
              {...(index === 0 ? { 'data-tour': 'service-card' } : {})}
            >
              <div className="service-card-glow"></div>
              <div className="service-header">
                <span className="service-category">{service.category}</span>
                <div className="service-reward-badge">
                  <span className="reward-icon">{Icons.coin}</span>
                  <span className="reward-amount">${service.price}</span>
                </div>
              </div>

              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>

              {service.entrepreneur && (
                <div className="entrepreneur-info">
                  <span className="entrepreneur-avatar">{Icons.building}</span>
                  <div className="entrepreneur-details">
                    <span className="entrepreneur-name">{service.entrepreneur.companyName}</span>
                    <span className="entrepreneur-email">{service.entrepreneur.email}</span>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openCompanyProfile(service.entrepreneur.id)}
                    type="button"
                  >
                    View
                  </button>
                </div>
              )}

              <div className="service-footer">
                <div className="service-meta">
                  <div className="service-duration">
                    <span className="duration-icon">{Icons.clock}</span>
                    <span>{service.duration}</span>
                  </div>
                </div>

                <div className="service-actions">
                  <button 
                    className="btn btn-ghost btn-icon" 
                    onClick={() => navigate(`/chat?serviceId=${service.id}`)}
                    title="Ask a question"
                  >
                    {Icons.message}
                  </button>
                  <button 
                    className="btn btn-primary btn-book" 
                    onClick={() => handleBookService(service)}
                    {...(index === 0 ? { 'data-tour': 'apply-button' } : {})}
                  >
                    <span className="btn-sparkle">{Icons.sparkle}</span>
                    Accept Quest
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Booking</h2>
              <button className="modal-close" onClick={() => setSelectedService(null)}>{Icons.close}</button>
            </div>

            <div className="modal-body">
              <div className="booking-summary">
                <div className="booking-service">
                  <span className="service-category">{selectedService.category}</span>
                  <h3>{selectedService.name}</h3>
                  <p>{selectedService.description}</p>
                </div>

                <div className="booking-details">
                  <div className="booking-detail">
                    <span className="detail-label">Provider</span>
                    <span className="detail-value">{selectedService.entrepreneur?.companyName || 'N/A'}</span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{selectedService.duration}</span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-label">Price</span>
                    <span className="detail-value price">${selectedService.price}</span>
                  </div>
                </div>

                <div className="booking-message-field">
                  <label htmlFor="bookingMessage">Message to entrepreneur (optional)</label>
                  <textarea
                    id="bookingMessage"
                    placeholder="Describe your requirements or any special requests..."
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedService(null)} disabled={bookingLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmBooking} disabled={bookingLoading}>
                {bookingLoading ? 'Sending...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientServices;
