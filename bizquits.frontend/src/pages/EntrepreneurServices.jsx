import { useState, useEffect } from 'react';
import './EntrepreneurServices.css';

function EntrepreneurServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });

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
          description: 'Custom website design and development using modern technologies.',
          price: 500,
          duration: '2 weeks',
          category: 'Development',
          bookings: 12,
          status: 'active'
        },
        {
          id: 2,
          name: 'SEO Optimization',
          description: 'Improve your website search rankings with our SEO services.',
          price: 200,
          duration: '1 week',
          category: 'Marketing',
          bookings: 8,
          status: 'active'
        },
        {
          id: 3,
          name: 'Logo Design',
          description: 'Professional logo design with multiple concepts and revisions.',
          price: 150,
          duration: '3 days',
          category: 'Design',
          bookings: 5,
          status: 'paused'
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: ''
    });
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      category: service.category
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingService) {
      setServices(prev =>
        prev.map(s =>
          s.id === editingService.id
            ? { ...s, ...formData, price: parseFloat(formData.price) }
            : s
        )
      );
    } else {
      const newService = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        bookings: 0,
        status: 'active'
      };
      setServices(prev => [...prev, newService]);
    }
    setShowModal(false);
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
    }
  };

  const handleToggleStatus = (serviceId) => {
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    );
  };

  if (loading) {
    return <div className="loading-state">Loading services...</div>;
  }

  return (
    <div className="entrepreneur-services-container">
      <div className="page-header">
        <div>
          <h1>My Services</h1>
          <p>Manage the services you offer to clients</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddService}>
          <span className="btn-icon">+</span>
          Add Service
        </button>
      </div>

      <div className="services-stats">
        <div className="stat-card">
          <div className="stat-value">{services.length}</div>
          <div className="stat-label">Total Services</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{services.filter(s => s.status === 'active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{services.reduce((acc, s) => acc + s.bookings, 0)}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${services.reduce((acc, s) => acc + (s.price * s.bookings), 0).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📦</div>
          <h3>No services yet</h3>
          <p>Start by adding your first service to offer clients</p>
          <button className="btn btn-primary" onClick={handleAddService}>
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className={`service-card card ${service.status === 'paused' ? 'service-paused' : ''}`}>
              <div className="service-header">
                <span className="service-category">{service.category}</span>
                <span className={`service-status status-${service.status}`}>
                  {service.status}
                </span>
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-meta">
                <div className="service-price">
                  <span className="price-value">${service.price}</span>
                </div>
                <div className="service-duration">
                  <span className="duration-icon">⏱️</span>
                  {service.duration}
                </div>
              </div>
              <div className="service-stats">
                <span>{service.bookings} bookings</span>
                <span>${(service.price * service.bookings).toLocaleString()} earned</span>
              </div>
              <div className="service-actions">
                <button className="btn btn-sm btn-outline" onClick={() => handleEditService(service)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => handleToggleStatus(service.id)}>
                  {service.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteService(service.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Service Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Website Development"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your service..."
                  rows={3}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 weeks"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntrepreneurServices;
