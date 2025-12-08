import { useState, useEffect } from 'react';
import { serviceApi } from '../services/api';
import { useToast } from '../components/Toast';
import './EntrepreneurServices.css';

function EntrepreneurServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await serviceApi.getMyServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      const message = error.response?.data || 'Failed to load services';
      toast.error(typeof message === 'string' ? message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('submit');
    
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        price: parseFloat(formData.price),
        isActive: editingService ? editingService.isActive : true
      };

      if (editingService) {
        await serviceApi.update(editingService.id, serviceData);
        toast.success('Service updated successfully!');
      } else {
        await serviceApi.create(serviceData);
        toast.success('Service created successfully!');
      }
      
      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      const message = error.response?.data || 'Failed to save service';
      toast.error(typeof message === 'string' ? message : 'Failed to save service');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setActionLoading(serviceId);
      try {
        await serviceApi.delete(serviceId);
        toast.success('Service deleted successfully!');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleStatus = async (serviceId) => {
    setActionLoading(serviceId);
    try {
      await serviceApi.toggle(serviceId);
      toast.success('Service status updated!');
      fetchServices();
    } catch (error) {
      console.error('Error toggling service:', error);
      toast.error('Failed to update service status');
    } finally {
      setActionLoading(null);
    }
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
          <div className="stat-value">{services.filter(s => s.isActive).length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{services.filter(s => !s.isActive).length}</div>
          <div className="stat-label">Paused</div>
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
            <div key={service.id} className={`service-card card ${!service.isActive ? 'service-paused' : ''}`}>
              <div className="service-header">
                <span className="service-category">{service.category}</span>
                <span className={`service-status status-${service.isActive ? 'active' : 'paused'}`}>
                  {service.isActive ? 'active' : 'paused'}
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
              <div className="service-actions">
                <button 
                  className="btn btn-sm btn-outline" 
                  onClick={() => handleEditService(service)}
                  disabled={actionLoading === service.id}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-outline" 
                  onClick={() => handleToggleStatus(service.id)}
                  disabled={actionLoading === service.id}
                >
                  {actionLoading === service.id ? '...' : (service.isActive ? 'Pause' : 'Activate')}
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => handleDeleteService(service.id)}
                  disabled={actionLoading === service.id}
                >
                  {actionLoading === service.id ? '...' : 'Delete'}
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
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={actionLoading === 'submit'}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading === 'submit'}>
                  {actionLoading === 'submit' ? 'Saving...' : (editingService ? 'Save Changes' : 'Add Service')}
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
