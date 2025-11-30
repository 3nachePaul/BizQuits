import { useState, useEffect } from 'react';
import './ClientServices.css';

function ClientServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    // Mock data until backend endpoint is implemented
    setTimeout(() => {
      setServices([
        {
          id: 1,
          name: 'Website Development',
          description: 'Custom website design and development using modern technologies. Includes responsive design, SEO optimization, and content management system.',
          price: 500,
          duration: '2 weeks',
          category: 'Development',
          entrepreneur: {
            name: 'Tech Solutions LLC',
            rating: 4.8,
            reviews: 24,
            avatar: '💻'
          }
        },
        {
          id: 2,
          name: 'SEO Optimization',
          description: 'Improve your website search rankings with our comprehensive SEO services. Keyword research, on-page optimization, and monthly reporting included.',
          price: 200,
          duration: '1 week',
          category: 'Marketing',
          entrepreneur: {
            name: 'Digital Growth Co',
            rating: 4.5,
            reviews: 18,
            avatar: '📈'
          }
        },
        {
          id: 3,
          name: 'Logo Design',
          description: 'Professional logo design with multiple concepts and revisions. Includes brand guidelines and all file formats.',
          price: 150,
          duration: '3 days',
          category: 'Design',
          entrepreneur: {
            name: 'Creative Studio',
            rating: 4.9,
            reviews: 42,
            avatar: '🎨'
          }
        },
        {
          id: 4,
          name: 'Business Consulting',
          description: 'Strategic business consulting to help you grow. Market analysis, business planning, and growth strategies.',
          price: 300,
          duration: '1 week',
          category: 'Consulting',
          entrepreneur: {
            name: 'BizGrowth Partners',
            rating: 4.7,
            reviews: 15,
            avatar: '💼'
          }
        },
        {
          id: 5,
          name: 'Mobile App Development',
          description: 'Native and cross-platform mobile app development. iOS and Android apps with modern UI/UX design.',
          price: 1500,
          duration: '4 weeks',
          category: 'Development',
          entrepreneur: {
            name: 'AppCraft Studios',
            rating: 4.6,
            reviews: 31,
            avatar: '📱'
          }
        },
        {
          id: 6,
          name: 'Social Media Management',
          description: 'Full-service social media management including content creation, scheduling, and engagement analytics.',
          price: 250,
          duration: '1 month',
          category: 'Marketing',
          entrepreneur: {
            name: 'Social Buzz Agency',
            rating: 4.4,
            reviews: 28,
            avatar: '📢'
          }
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const categories = ['all', 'Development', 'Design', 'Marketing', 'Consulting'];
  
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-200', label: 'Under $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500+', label: '$500+' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.entrepreneur.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange === '0-200') matchesPrice = service.price < 200;
    else if (priceRange === '200-500') matchesPrice = service.price >= 200 && service.price <= 500;
    else if (priceRange === '500+') matchesPrice = service.price > 500;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleBookService = (service) => {
    setSelectedService(service);
  };

  const confirmBooking = () => {
    alert(`Booking confirmed for ${selectedService.name}! The entrepreneur will contact you shortly.`);
    setSelectedService(null);
  };

  if (loading) {
    return <div className="loading-state">Loading services...</div>;
  }

  return (
    <div className="client-services-container">
      <div className="page-header">
        <h1>Browse Services</h1>
        <p>Find the perfect service for your needs</p>
      </div>

      <div className="filters-section card">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search services, entrepreneurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
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
          <label>Price Range</label>
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-info">
        <span>{filteredServices.length} services found</span>
      </div>

      {filteredServices.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🔍</div>
          <h3>No services found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service.id} className="service-card card">
              <div className="service-header">
                <span className="service-category">{service.category}</span>
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="entrepreneur-info">
                <span className="entrepreneur-avatar">{service.entrepreneur.avatar}</span>
                <div className="entrepreneur-details">
                  <span className="entrepreneur-name">{service.entrepreneur.name}</span>
                  <div className="entrepreneur-rating">
                    <span className="star">⭐</span>
                    <span>{service.entrepreneur.rating}</span>
                    <span className="reviews">({service.entrepreneur.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="service-footer">
                <div className="service-meta">
                  <div className="service-price">
                    <span className="price-value">${service.price}</span>
                  </div>
                  <div className="service-duration">
                    <span className="duration-icon">⏱️</span>
                    {service.duration}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => handleBookService(service)}>
                  Book Now
                </button>
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
              <button className="modal-close" onClick={() => setSelectedService(null)}>×</button>
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
                    <span className="detail-value">{selectedService.entrepreneur.name}</span>
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
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedService(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientServices;
