import { useState, useEffect, useCallback } from 'react';
import { offerApi } from '../services/api';
import { useToast } from '../components/Toast';
import './EntrepreneurOffers.css';

const Icons = {
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2"/>
      <path d="M13 17v2"/>
      <path d="M13 11v2"/>
    </svg>
  ),
  discount: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5L5 19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1"/>
      <path d="M12 8v13"/>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  )
};

const OFFER_TYPES = [
  { value: 'JobMilestone', label: 'Job Milestone', icon: Icons.target, description: 'Reward at the X-th completed job' },
  { value: 'EarlyCompletion', label: 'Early Completion', icon: Icons.bolt, description: 'Bonus for early completion' },
  { value: 'Coupon', label: 'Coupon', icon: Icons.ticket, description: 'Discount coupon for services' },
  { value: 'Discount', label: 'Discount', icon: Icons.discount, description: 'Percentage discount on services' },
  { value: 'Referral', label: 'Referral', icon: Icons.users, description: 'Bonus for referring other clients' },
  { value: 'LoyaltyReward', label: 'Loyalty Reward', icon: Icons.star, description: 'Reward for loyal customers' }
];

const getOfferTypeInfo = (type) => OFFER_TYPES.find(t => t.value === type) || { icon: Icons.gift, label: type };

const EntrepreneurOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'JobMilestone',
    milestoneCount: '',
    earlyCompletionDays: '',
    discountPercentage: '',
    bonusValue: '',
    rewardDescription: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  const fetchOffers = useCallback(async () => {
    try {
      const response = await offerApi.getMyOffers();
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Could not load offers');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'JobMilestone',
      milestoneCount: '',
      earlyCompletionDays: '',
      discountPercentage: '',
      bonusValue: '',
      rewardDescription: '',
      validFrom: '',
      validUntil: '',
      isActive: true
    });
    setEditingOffer(null);
    setShowForm(false);
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      type: offer.type,
      milestoneCount: offer.milestoneCount || '',
      earlyCompletionDays: offer.earlyCompletionDays || '',
      discountPercentage: offer.discountPercentage || '',
      bonusValue: offer.bonusValue || '',
      rewardDescription: offer.rewardDescription || '',
      validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : '',
      validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
      isActive: offer.isActive
    });
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('form');

    const payload = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      milestoneCount: formData.milestoneCount ? parseInt(formData.milestoneCount) : null,
      earlyCompletionDays: formData.earlyCompletionDays ? parseInt(formData.earlyCompletionDays) : null,
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
      bonusValue: formData.bonusValue ? parseFloat(formData.bonusValue) : null,
      rewardDescription: formData.rewardDescription || null,
      validFrom: formData.validFrom || null,
      validUntil: formData.validUntil || null,
      isActive: formData.isActive
    };

    try {
      if (editingOffer) {
        await offerApi.update(editingOffer.id, payload);
        toast.success('Offer updated successfully!');
      } else {
        await offerApi.create(payload);
        toast.success('Offer created successfully!');
      }
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      const message = error.response?.data?.message || error.response?.data || 'Could not save offer';
      toast.error(typeof message === 'string' ? message : 'Could not save offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      setActionLoading(offerId);
      try {
        await offerApi.delete(offerId);
        toast.success('Offer deleted!');
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
        const message = error.response?.data?.message || error.response?.data || 'Could not delete offer';
        toast.error(typeof message === 'string' ? message : 'Could not delete offer');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggle = async (offerId) => {
    setActionLoading(offerId);
    try {
      await offerApi.toggle(offerId);
      toast.success('Offer status updated!');
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
      toast.error('Could not update offer status');
    } finally {
      setActionLoading(null);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'JobMilestone':
        return (
          <div className="form-group">
            <label>At which job number? *</label>
            <input
              type="number"
              value={formData.milestoneCount}
              onChange={(e) => setFormData({ ...formData, milestoneCount: e.target.value })}
              placeholder="e.g. 5 (at the 5th job)"
              min="1"
              required
            />
          </div>
        );
      case 'EarlyCompletion':
        return (
          <div className="form-group">
            <label>How many days early? *</label>
            <input
              type="number"
              value={formData.earlyCompletionDays}
              onChange={(e) => setFormData({ ...formData, earlyCompletionDays: e.target.value })}
              placeholder="e.g. 3 (3 days early)"
              min="1"
              required
            />
          </div>
        );
      case 'Discount':
        return (
          <div className="form-group">
            <label>Discount percentage (%) *</label>
            <input
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              placeholder="e.g. 15 (15% discount)"
              min="0.01"
              max="100"
              step="0.01"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading-state">Loading offers...</div>;
  }

  return (
    <div className="entrepreneur-offers-container">
      <div className="page-header">
        <div className="header-content">
          <h1><span className="header-icon">{Icons.gift}</span> My Offers</h1>
          <p>Create and manage promotional offers for your clients</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Offer
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingOffer ? 'Edit Offer' : 'New Offer'}</h2>
              <button className="btn-close" onClick={resetForm}>{Icons.close}</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Offer Type *</label>
                <div className="offer-type-grid">
                  {OFFER_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`offer-type-card ${formData.type === type.value ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-label">{type.label}</span>
                      <span className="type-description">{type.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Bonus for loyal customers"
                  required
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe in detail the offer and conditions..."
                  required
                  rows={4}
                  maxLength={2000}
                />
              </div>

              {renderTypeSpecificFields()}

              <div className="form-group">
                <label>Bonus/Coupon Value (RON)</label>
                <input
                  type="number"
                  value={formData.bonusValue}
                  onChange={(e) => setFormData({ ...formData, bonusValue: e.target.value })}
                  placeholder="e.g. 50"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>What does the client receive?</label>
                <input
                  type="text"
                  value={formData.rewardDescription}
                  onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
                  placeholder="e.g. A free service, a 50 RON coupon, etc."
                  maxLength={500}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              {editingOffer && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active Offer
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading === 'form'}>
                  {actionLoading === 'form' ? 'Saving...' : (editingOffer ? 'Update' : 'Create Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.gift}</div>
          <h3>No offers yet</h3>
          <p>Create your first promotional offer to attract more clients!</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="offers-grid">
          {offers.map((offer) => {
            const typeInfo = getOfferTypeInfo(offer.type);
            return (
              <div key={offer.id} className={`offer-card ${!offer.isActive ? 'inactive' : ''}`}>
                <div className="offer-header">
                  <span className="offer-type-badge">
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  <span className={`status-badge ${offer.isActive ? 'active' : 'inactive'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3>{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>
                
                <div className="offer-details">
                  {offer.milestoneCount && (
                    <div className="detail-item">
                      <span className="detail-label">At</span>
                      <span className="detail-value">{offer.milestoneCount}th job</span>
                    </div>
                  )}
                  {offer.earlyCompletionDays && (
                    <div className="detail-item">
                      <span className="detail-label">By</span>
                      <span className="detail-value">{offer.earlyCompletionDays} days early</span>
                    </div>
                  )}
                  {offer.discountPercentage && (
                    <div className="detail-item">
                      <span className="detail-label">Discount</span>
                      <span className="detail-value">{offer.discountPercentage}%</span>
                    </div>
                  )}
                  {offer.bonusValue && (
                    <div className="detail-item">
                      <span className="detail-label">Value</span>
                      <span className="detail-value">{offer.bonusValue} RON</span>
                    </div>
                  )}
                  {offer.rewardDescription && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Reward</span>
                      <span className="detail-value">{offer.rewardDescription}</span>
                    </div>
                  )}
                </div>

                {(offer.validFrom || offer.validUntil) && (
                  <div className="validity-period">
                    {offer.validFrom && <span>From: {new Date(offer.validFrom).toLocaleDateString('en-US')}</span>}
                    {offer.validUntil && <span>Until: {new Date(offer.validUntil).toLocaleDateString('en-US')}</span>}
                  </div>
                )}

                <div className="offer-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(offer)}
                    title="Edit"
                  >
                    {Icons.edit}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleToggle(offer.id)}
                    disabled={actionLoading === offer.id}
                    title={offer.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {offer.isActive ? Icons.pause : Icons.play}
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(offer.id)}
                    disabled={actionLoading === offer.id}
                    title="Delete"
                  >
                    {Icons.trash}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EntrepreneurOffers;
