import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicEntrepreneurApi } from '../services/api';

const CompanyPublicProfile = () => {
  const { id } = useParams(); // entrepreneurProfileId
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const stars = (rating) => {
    const r = Math.max(0, Math.min(5, Math.round(Number(rating ?? 0))));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await publicEntrepreneurApi.getProfile(id);
        setData(res.data);
      } catch (e) {
        console.error('Error loading company public profile:', e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const company = data?.entrepreneurProfile;

  const avg = useMemo(() => Number(data?.companyRating?.average ?? 0), [data]);
  const count = useMemo(() => Number(data?.companyRating?.count ?? 0), [data]);

  const services = useMemo(() => data?.services ?? [], [data]);
  const ratingsByService = useMemo(() => data?.ratingsByService ?? [], [data]);
  const reviews = useMemo(() => data?.reviews ?? [], [data]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!data || !company) return <div style={{ padding: 24 }}>Company not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 6 }}>{company.companyName}</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        CUI: {company.cui} • Contact: {company.email}
      </div>

      {/* Rating summary */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Rating</h3>
        <div style={{ fontSize: 22, marginBottom: 6 }}>
          {stars(avg)} <strong>{avg.toFixed(2)}</strong>/5
        </div>
        <div style={{ opacity: 0.8 }}>{count} reviews</div>
      </div>

      {/* Services + ratings by service */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Services</h3>

        {services.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No active services.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {services.map((s) => (
              <div key={s.id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>{s.category}</div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontWeight: 700 }}>${s.price}</div>
                  <div style={{ opacity: 0.8, textAlign: 'right' }}>{s.duration}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {ratingsByService.length > 0 && (
          <div style={{ marginTop: 14, opacity: 0.95 }}>
            <h4 style={{ margin: '10px 0 8px 0' }}>Ratings by service</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ratingsByService.map((r) => (
                <div
                  key={r.serviceId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 0',
                    borderBottom: '1px dashed var(--border-color)',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{r.serviceName}</span>
                  <span>
                    {Number(r.average ?? 0).toFixed(2)} / 5 ({r.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews list */}
      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Reviews</h3>

        {reviews.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No reviews yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => {
              // IMPORTANT: backend response has service inside r.service with serviceName/serviceId etc.
              const serviceName = r.service?.serviceName || `Service #${r.service?.serviceId ?? 'N/A'}`;
              const serviceMeta = [
                r.service?.category ? r.service.category : null,
                r.service?.price != null ? `$${r.service.price}` : null,
                r.service?.duration ? r.service.duration : null,
              ].filter(Boolean);

              const rating = Math.max(0, Math.min(5, Number(r.rating ?? 0)));

              return (
                <div key={r.id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{serviceName}</div>
                      {serviceMeta.length > 0 && (
                        <div style={{ opacity: 0.8, fontSize: 13 }}>{serviceMeta.join(' • ')}</div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18 }}>{stars(rating)}</div>
                      <div style={{ opacity: 0.7, fontSize: 13 }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{r.comment}</div>

                  {r.clientEmail && (
                    <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                      by {r.clientEmail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPublicProfile;
