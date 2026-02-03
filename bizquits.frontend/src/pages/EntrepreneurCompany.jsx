import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, publicEntrepreneurApi } from '../services/api';
import './EntrepreneurCompany.css';

const Icons = {
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
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
};

const EntrepreneurCompany = () => {
  const { user } = useAuth();
  const { id } = useParams(); //  dacă există => pagină publică
  const isPublic = !!id;

  const [companyInfo, setCompanyInfo] = useState(null);
  const [reviewsData, setReviewsData] = useState({ averageRating: null, totalReviews: 0, reviews: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCompanyInfo = async () => {
    setIsLoading(true);
    try {
      if (isPublic) {
        const res = await publicEntrepreneurApi.getProfile(id);

        // Backend-ul ar trebui să trimită ceva gen:
        // { entrepreneurProfileId, companyName, cui, email, averageRating, totalReviews, reviews:[{rating, comment, serviceName, createdAt}] }
        const data = res.data;

        setCompanyInfo({
          companyName: data.companyName,
          cui: data.cui,
          isApproved: true, // public => deja aprobat
          email: data.email
        });

        setReviewsData({
          averageRating: data.averageRating ?? data.avgRating ?? null,
          totalReviews: data.totalReviews ?? (data.reviews?.length ?? 0),
          reviews: data.reviews ?? []
        });
      } else {
        const response = await userService.getProfile();
        const profile = response.data;

        if (profile.entrepreneurProfile) {
          setCompanyInfo({
            entrepreneurProfileId: profile.entrepreneurProfile.id,
            companyName: profile.entrepreneurProfile.companyName,
            cui: profile.entrepreneurProfile.cui,
            isApproved: profile.entrepreneurProfile.isApproved,
            email: profile.email
          });
        }
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    const r = Number(rating || 0);
    return (
      <div className="company-stars" aria-label={`Rating ${r} out of 5`}>
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={`company-star ${s <= Math.round(r) ? 'on' : ''}`}>*</span>
        ))}
      </div>
    );
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
        <h1>{isPublic ? 'Company Profile' : 'My Company'}</h1>
        <p>{isPublic ? 'Public company profile' : 'Manage your business profile and information'}</p>
      </div>

      <div className="company-layout">
        <div className="company-main">
          <div className="card company-profile-card">
            <div className="company-header">
              <div className="company-logo">
                <span>{Icons.building}</span>
              </div>
              <div className="company-info">
                <h2>{companyInfo?.companyName || 'Company Name'}</h2>
                <p className="company-cui">CUI: {companyInfo?.cui || 'N/A'}</p>

                {/*  PUBLIC: rating mediu */}
                {isPublic && (
                  <div className="company-rating-row">
                    {renderStars(reviewsData.averageRating)}
                    <div className="company-rating-meta">
                      <strong>{(reviewsData.averageRating ?? 0).toFixed(1)}</strong> / 5
                      <span className="company-rating-count">({reviewsData.totalReviews} reviews)</span>
                    </div>
                  </div>
                )}
              </div>

              {!isPublic && (
                <div className={`status-badge ${companyInfo?.isApproved ? 'status-approved' : 'status-pending'}`}>
                  {companyInfo?.isApproved ? <><span className="status-icon">{Icons.check}</span> Approved</> : <><span className="status-icon">{Icons.clock}</span> Pending Approval</>}
                </div>
              )}
            </div>

            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Email</label>
                  <span>{isPublic ? (companyInfo?.email || '-') : (user?.email || '-')}</span>
                </div>
                {!isPublic && (
                  <div className="info-item">
                    <label>Registration Status</label>
                    <span className={companyInfo?.isApproved ? 'text-success' : 'text-warning'}>
                      {companyInfo?.isApproved ? 'Active' : 'Awaiting Approval'}
                    </span>
                  </div>
                )}
                <div className="info-item">
                  <label>Member Since</label>
                  <span>{new Date(Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isPublic && !companyInfo?.isApproved && (
            <div className="alert alert-warning">
              <div className="alert-icon">{Icons.clock}</div>
              <div className="alert-content">
                <h4>Account Pending Approval</h4>
                <p>Your entrepreneur account is currently being reviewed by our administrators. You will be notified once your account is approved.</p>
              </div>
            </div>
          )}

          {/*  PUBLIC: lista reviews */}
          {isPublic && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Reviews</h3>
              </div>
              <div className="card-content">
                {(reviewsData.reviews?.length ?? 0) === 0 ? (
                  <div className="reviews-empty">
                    No approved reviews yet.
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviewsData.reviews.map((r) => (
                      <div key={r.id || `${r.createdAt}-${r.serviceName}`} className="review-item">
                        <div className="review-top">
                          <div className="review-service">{r.serviceName || r.bookingTitle || 'Service'}</div>
                          <div className="review-rating">
                            {renderStars(r.rating)}
                            <span className="review-score">{Number(r.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="review-comment">{r.comment}</div>
                        {r.createdAt && (
                          <div className="review-date">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privat: form existente */}
          {!isPublic && (
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
          )}
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
                  <span className="quick-stat-value">{isPublic ? (reviewsData.totalReviews || 0) : 0}</span>
                  <span className="quick-stat-label">Reviews</span>
                </div>
              </div>

              {isPublic && (
                <div className="public-rating-mini">
                  <div className="public-rating-label">Average Rating</div>
                  <div className="public-rating-value">
                    {(reviewsData.averageRating ?? 0).toFixed(1)} / 5
                  </div>
                </div>
              )}
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
