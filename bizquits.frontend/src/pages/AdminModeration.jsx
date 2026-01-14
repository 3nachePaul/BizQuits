import { useState, useEffect, useCallback } from 'react';
import { adminModerationApi } from '../services/api';
import { useToast } from '../components/Toast';
import './AdminModeration.css';

// SVG Icons
const Icons = {
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v10H4V12M22 7v5H2V7M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
};

export default function AdminModeration() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('offers');
  const [loading, setLoading] = useState(true);

  // Data
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [challenges, setChallenges] = useState([]);

  // Edit modals
  const [editModal, setEditModal] = useState({ show: false, type: '', item: null });
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [offersRes, servicesRes, challengesRes] = await Promise.all([
        adminModerationApi.getAllOffers(),
        adminModerationApi.getAllServices(),
        adminModerationApi.getAllChallenges()
      ]);
      setOffers(offersRes.data);
      setServices(servicesRes.data);
      setChallenges(challengesRes.data);
    } catch (err) {
      toast.error('Could not load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, []);

  const getErrorMessage = (err) => {
    if (err?.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') return d;
      if (d.title) return d.title;
      if (d.message) return d.message;
    }
    return 'An unexpected error occurred.';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Edit handlers
  const openEditModal = (type, item) => {
    setEditModal({ show: true, type, item });
    if (type === 'offer') {
      setEditData({
        title: item.title,
        description: item.description,
        isActive: item.isActive
      });
    } else if (type === 'service') {
      setEditData({
        name: item.name,
        description: item.description,
        isActive: item.isActive
      });
    } else if (type === 'challenge') {
      setEditData({
        title: item.title,
        description: item.description,
        status: item.status
      });
    }
  };

  const closeEditModal = () => {
    setEditModal({ show: false, type: '', item: null });
    setEditData({});
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const { type, item } = editModal;

      if (type === 'offer') {
        await adminModerationApi.updateOffer(item.id, editData);
        toast.success('Offer updated!');
      } else if (type === 'service') {
        await adminModerationApi.updateService(item.id, editData);
        toast.success('Service updated!');
      } else if (type === 'challenge') {
        await adminModerationApi.updateChallenge(item.id, editData);
        toast.success('Challenge updated!');
      }

      closeEditModal();
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async (type, id) => {
    const confirmMsg = {
      offer: 'Are you sure you want to delete this offer?',
      service: 'Are you sure you want to delete this service?',
      challenge: 'Are you sure you want to delete this challenge?'
    };

    if (!confirm(confirmMsg[type])) return;

    try {
      setActionLoading(`${type}-${id}`);

      if (type === 'offer') {
        await adminModerationApi.deleteOffer(id);
        toast.success('Offer deleted!');
      } else if (type === 'service') {
        await adminModerationApi.deleteService(id);
        toast.success('Service deleted!');
      } else if (type === 'challenge') {
        await adminModerationApi.deleteChallenge(id);
        toast.success('Challenge deleted!');
      }

      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle active status
  const toggleActive = async (type, item) => {
    try {
      setActionLoading(`${type}-${item.id}`);

      if (type === 'offer') {
        await adminModerationApi.updateOffer(item.id, { isActive: !item.isActive });
      } else if (type === 'service') {
        await adminModerationApi.updateService(item.id, { isActive: !item.isActive });
      }

      toast.success(`${type === 'offer' ? 'Offer' : 'Service'} ${!item.isActive ? 'activated' : 'deactivated'}!`);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-moderation-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading moderation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-moderation-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">{Icons.shield}</span>
            Content Moderation
          </h1>
          <p>Moderate offers, services, and challenges</p>
        </div>
        <button className="btn-refresh" onClick={loadData} disabled={loading}>
          <span className="btn-icon">{Icons.refresh}</span>
          Refresh
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          <span className="tab-icon">{Icons.gift}</span>
          Offers
          <span className="badge">{offers.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <span className="tab-icon">{Icons.briefcase}</span>
          Services
          <span className="badge">{services.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <span className="tab-icon">{Icons.flag}</span>
          Challenges
          <span className="badge">{challenges.length}</span>
        </button>
      </div>

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="table-container">
          <h3>All Offers ({offers.length})</h3>

          {offers.length === 0 ? (
            <div className="empty-state">
              <p>No offers in the system.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Entrepreneur</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className={!offer.isActive ? 'inactive' : ''}>
                    <td>
                      <strong>{offer.title}</strong>
                      <br />
                      <small className="description-preview">{offer.description?.substring(0, 50)}...</small>
                    </td>
                    <td>
                      <span className="type-badge">{offer.type}</span>
                    </td>
                    <td>
                      <div className="entrepreneur-cell">
                        <span className="company">{offer.entrepreneur?.companyName}</span>
                        <span className="email">{offer.entrepreneur?.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${offer.isActive ? 'active' : 'inactive'}`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(offer.createdAt)}</td>
                    <td className="action-buttons">
                      <button
                        className={`btn-toggle ${offer.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleActive('offer', offer)}
                        disabled={actionLoading === `offer-${offer.id}`}
                        title={offer.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {offer.isActive ? Icons.x : Icons.check}
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal('offer', offer)}
                        title="Edit"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete('offer', offer.id)}
                        disabled={actionLoading === `offer-${offer.id}`}
                        title="Delete"
                      >
                        {Icons.trash}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="table-container">
          <h3>All Services ({services.length})</h3>

          {services.length === 0 ? (
            <div className="empty-state">
              <p>No services in the system.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Entrepreneur</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className={!service.isActive ? 'inactive' : ''}>
                    <td>
                      <strong>{service.name}</strong>
                      <br />
                      <small className="description-preview">{service.description?.substring(0, 50)}...</small>
                    </td>
                    <td>
                      <span className="category-badge">{service.category}</span>
                    </td>
                    <td>{service.price?.toFixed(2)} RON</td>
                    <td>
                      <div className="entrepreneur-cell">
                        <span className="company">{service.entrepreneur?.companyName}</span>
                        <span className="email">{service.entrepreneur?.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className={`btn-toggle ${service.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleActive('service', service)}
                        disabled={actionLoading === `service-${service.id}`}
                        title={service.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {service.isActive ? Icons.x : Icons.check}
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal('service', service)}
                        title="Edit"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete('service', service.id)}
                        disabled={actionLoading === `service-${service.id}`}
                        title="Delete"
                      >
                        {Icons.trash}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="table-container">
          <h3>All Challenges ({challenges.length})</h3>

          {challenges.length === 0 ? (
            <div className="empty-state">
              <p>No challenges in the system.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Entrepreneur</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className={challenge.status === 'Cancelled' ? 'inactive' : ''}>
                    <td>
                      <strong>{challenge.title}</strong>
                      <br />
                      <small className="description-preview">{challenge.description?.substring(0, 50)}...</small>
                    </td>
                    <td>
                      <span className="type-badge">{challenge.type}</span>
                    </td>
                    <td>
                      <div className="entrepreneur-cell">
                        <span className="company">{challenge.entrepreneur?.companyName}</span>
                        <span className="email">{challenge.entrepreneur?.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${challenge.status.toLowerCase()}`}>
                        {challenge.status}
                      </span>
                    </td>
                    <td>{challenge.participantsCount}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal('challenge', challenge)}
                        title="Edit"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete('challenge', challenge.id)}
                        disabled={actionLoading === `challenge-${challenge.id}`}
                        title="Delete"
                      >
                        {Icons.trash}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {editModal.type.charAt(0).toUpperCase() + editModal.type.slice(1)}</h3>
              <button className="modal-close" onClick={closeEditModal}>
                {Icons.x}
              </button>
            </div>

            <div className="modal-body">
              {editModal.type === 'offer' && (
                <>
                  <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                      type="text"
                      id="edit-title"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={editData.isActive || false}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                </>
              )}

              {editModal.type === 'service' && (
                <>
                  <div className="form-group">
                    <label htmlFor="edit-name">Name</label>
                    <input
                      type="text"
                      id="edit-name"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={editData.isActive || false}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                </>
              )}

              {editModal.type === 'challenge' && (
                <>
                  <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                      type="text"
                      id="edit-title"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-status">Status</label>
                    <select
                      id="edit-status"
                      value={editData.status || 'Draft'}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeEditModal}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
