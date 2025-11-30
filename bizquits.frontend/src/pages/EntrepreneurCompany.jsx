import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import './EntrepreneurCompany.css';

const EntrepreneurCompany = () => {
  const { user } = useAuth();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getProfile();
      const profile = response.data;
      if (profile.entrepreneurProfile) {
        setCompanyInfo({
          companyName: profile.entrepreneurProfile.companyName,
          cui: profile.entrepreneurProfile.cui,
          isApproved: profile.entrepreneurProfile.isApproved,
          email: profile.email
        });
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
      // Fallback mock data
      setCompanyInfo({
        companyName: 'Your Company Name',
        cui: 'RO12345678',
        isApproved: false,
        email: user?.email
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="entrepreneur-company-container">
        <div className="loading-state">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="entrepreneur-company-container">
      <div className="page-header">
        <h1>My Company</h1>
        <p>Manage your business profile and information</p>
      </div>

      <div className="company-layout">
        <div className="company-main">
          <div className="card company-profile-card">
            <div className="company-header">
              <div className="company-logo">
                <span>🏢</span>
              </div>
              <div className="company-info">
                <h2>{companyInfo?.companyName || 'Company Name'}</h2>
                <p className="company-cui">CUI: {companyInfo?.cui || 'N/A'}</p>
              </div>
              <div className={`status-badge ${companyInfo?.isApproved ? 'status-approved' : 'status-pending'}`}>
                {companyInfo?.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
              </div>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Registration Status</label>
                  <span className={companyInfo?.isApproved ? 'text-success' : 'text-warning'}>
                    {companyInfo?.isApproved ? 'Active' : 'Awaiting Approval'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <span>{new Date(companyInfo?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!companyInfo?.isApproved && (
            <div className="alert alert-warning">
              <div className="alert-icon">⏳</div>
              <div className="alert-content">
                <h4>Account Pending Approval</h4>
                <p>Your entrepreneur account is currently being reviewed by our administrators. You will be notified once your account is approved.</p>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Company Details</h3>
              <button className="btn btn-secondary btn-sm">Edit</button>
            </div>
            <div className="card-content">
              <form className="company-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" value={companyInfo?.companyName || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>CUI (Company Registration Number)</label>
                  <input type="text" value={companyInfo?.cui || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Business Email</label>
                  <input type="email" value={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Describe your business..." rows={4} />
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="company-sidebar">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Stats</h3>
            </div>
            <div className="card-content">
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="quick-stat-value">0</span>
                  <span className="quick-stat-label">Services</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">0</span>
                  <span className="quick-stat-label">Bookings</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">0</span>
                  <span className="quick-stat-label">Reviews</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tips</h3>
            </div>
            <div className="card-content">
              <ul className="tips-list">
                <li>Complete your company profile to attract more clients</li>
                <li>Add services to start receiving bookings</li>
                <li>Respond promptly to inquiries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurCompany;
