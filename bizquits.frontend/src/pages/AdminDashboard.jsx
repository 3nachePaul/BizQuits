import { useEffect, useState, useCallback } from 'react';
import { adminService, adminReviewApi } from '../services/api';
import { useToast } from '../components/Toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Entrepreneurs
  const [pendingEntrepreneurs, setPendingEntrepreneurs] = useState([]);
  const [isLoadingEntrepreneurs, setIsLoadingEntrepreneurs] = useState(true);
  const [actionLoadingEntrepreneur, setActionLoadingEntrepreneur] = useState(null);

  // Reviews
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [actionLoadingReview, setActionLoadingReview] = useState(null);

  // Confirm modal (generic)
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: '', // 'approveEntrepreneur' | 'rejectEntrepreneur' | 'approveReview' | 'rejectReview'
    id: null,
    label: '',
  });

  const toast = useToast();

  const getErrorMessage = (err) => {
    if (err?.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') return d;
      if (d.title) return d.title;
      if (d.message) return d.message;
    }
    return 'An unexpected error occurred.';
  };

  // -------------------------
  // FETCH: Entrepreneurs
  // -------------------------
  const fetchPendingEntrepreneurs = useCallback(async () => {
    setIsLoadingEntrepreneurs(true);
    try {
      const response = await adminService.getPendingEntrepreneurs();
      setPendingEntrepreneurs(response.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoadingEntrepreneurs(false);
    }
  }, [toast]);

  // -------------------------
  // FETCH: Reviews
  // -------------------------
  const fetchPendingReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const response = await adminReviewApi.getPending();
      setPendingReviews(response.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoadingReviews(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingEntrepreneurs();
    fetchPendingReviews();
  }, []);

  // -------------------------
  // ENTREPRENEUR actions
  // -------------------------
  const approveEntrepreneur = async (id) => {
    setActionLoadingEntrepreneur(id);
    try {
      await adminService.approveEntrepreneur(id);
      toast.success('Entrepreneur approved successfully!');
      fetchPendingEntrepreneurs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingEntrepreneur(null);
      setConfirmDialog({ show: false, type: '', id: null, label: '' });
    }
  };

  const rejectEntrepreneur = async (id) => {
    setActionLoadingEntrepreneur(id);
    try {
      await adminService.rejectEntrepreneur(id);
      toast.success('Entrepreneur rejected and account deleted successfully!');
      fetchPendingEntrepreneurs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingEntrepreneur(null);
      setConfirmDialog({ show: false, type: '', id: null, label: '' });
    }
  };

  // -------------------------
  // REVIEW actions
  // -------------------------
  const approveReview = async (id) => {
    setActionLoadingReview(id);
    try {
      await adminReviewApi.approve(id);
      toast.success('Review approved!');
      fetchPendingReviews();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingReview(null);
      setConfirmDialog({ show: false, type: '', id: null, label: '' });
    }
  };

  const rejectReview = async (id) => {
    setActionLoadingReview(id);
    try {
      await adminReviewApi.reject(id);
      toast.success('Review rejected!');
      fetchPendingReviews();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingReview(null);
      setConfirmDialog({ show: false, type: '', id: null, label: '' });
    }
  };

  // -------------------------
  // CONFIRM modal
  // -------------------------
  const openConfirmDialog = (type, id, label) => {
    setConfirmDialog({ show: true, type, id, label });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, type: '', id: null, label: '' });
  };

  const confirmAction = () => {
    const { type, id } = confirmDialog;
    if (!id) return;

    if (type === 'approveEntrepreneur') return approveEntrepreneur(id);
    if (type === 'rejectEntrepreneur') return rejectEntrepreneur(id);
    if (type === 'approveReview') return approveReview(id);
    if (type === 'rejectReview') return rejectReview(id);
  };

  const isAnyActionLoading =
    actionLoadingEntrepreneur !== null || actionLoadingReview !== null;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage entrepreneur approvals and review moderation.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-refresh"
              onClick={fetchPendingEntrepreneurs}
              disabled={isLoadingEntrepreneurs}
              title="Refresh entrepreneurs"
            >
              {isLoadingEntrepreneurs ? 'Refreshing...' : 'Refresh Entrepreneurs'}
            </button>

            <button
              className="btn-refresh"
              onClick={fetchPendingReviews}
              disabled={isLoadingReviews}
              title="Refresh reviews"
            >
              {isLoadingReviews ? 'Refreshing...' : 'Refresh Reviews'}
            </button>
          </div>
        </div>
      </header>

      {/* =========================
          PENDING ENTREPRENEURS
          ========================= */}
      <div className="table-container">
        <h3>Pending Entrepreneurs ({pendingEntrepreneurs.length})</h3>

        {isLoadingEntrepreneurs ? (
          <div className="loading-spinner">Loading...</div>
        ) : pendingEntrepreneurs.length === 0 ? (
          <div className="empty-state">
            <p>No pending entrepreneurs for approval.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Company</th>
                <th>CUI</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingEntrepreneurs.map((entrepreneur) => (
                <tr key={entrepreneur.id}>
                  <td>{entrepreneur.email}</td>
                  <td>{entrepreneur.companyName}</td>
                  <td>{entrepreneur.cui}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() =>
                        openConfirmDialog(
                          'approveEntrepreneur',
                          entrepreneur.id,
                          entrepreneur.email
                        )
                      }
                      disabled={actionLoadingEntrepreneur === entrepreneur.id}
                    >
                      {actionLoadingEntrepreneur === entrepreneur.id ? '...' : 'Approve'}
                    </button>

                    <button
                      className="btn-reject"
                      onClick={() =>
                        openConfirmDialog(
                          'rejectEntrepreneur',
                          entrepreneur.id,
                          entrepreneur.email
                        )
                      }
                      disabled={actionLoadingEntrepreneur === entrepreneur.id}
                    >
                      {actionLoadingEntrepreneur === entrepreneur.id ? '...' : 'Reject'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================
          PENDING REVIEWS
          ========================= */}
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        <h3>Pending Reviews ({pendingReviews.length})</h3>

        {isLoadingReviews ? (
          <div className="loading-spinner">Loading...</div>
        ) : pendingReviews.length === 0 ? (
          <div className="empty-state">
            <p>No pending reviews.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingReviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.clientEmail}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong>{r.serviceName}</strong>
                      <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>ServiceId: {r.serviceId}</span>
                    </div>
                  </td>
                  <td>{r.rating}/5</td>
                  <td style={{ maxWidth: 420, whiteSpace: 'pre-wrap' }}>{r.comment}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() => openConfirmDialog('approveReview', r.id, `review #${r.id}`)}
                      disabled={actionLoadingReview === r.id}
                    >
                      {actionLoadingReview === r.id ? '...' : 'Approve'}
                    </button>

                    <button
                      className="btn-reject"
                      onClick={() => openConfirmDialog('rejectReview', r.id, `review #${r.id}`)}
                      disabled={actionLoadingReview === r.id}
                    >
                      {actionLoadingReview === r.id ? '...' : 'Reject'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================
          CONFIRM MODAL
          ========================= */}
      {confirmDialog.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm action</h3>

            <p>
              {confirmDialog.type === 'approveEntrepreneur' && (
                <>
                  Approve entrepreneur <strong>{confirmDialog.label}</strong>?
                </>
              )}
              {confirmDialog.type === 'rejectEntrepreneur' && (
                <>
                  Reject entrepreneur <strong>{confirmDialog.label}</strong>? This will delete their account.
                </>
              )}
              {confirmDialog.type === 'approveReview' && (
                <>
                  Approve <strong>{confirmDialog.label}</strong>?
                </>
              )}
              {confirmDialog.type === 'rejectReview' && (
                <>
                  Reject <strong>{confirmDialog.label}</strong>?
                </>
              )}
            </p>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeConfirmDialog} disabled={isAnyActionLoading}>
                Cancel
              </button>

              <button
                className={
                  confirmDialog.type.includes('approve') ? 'btn-approve' : 'btn-reject'
                }
                onClick={confirmAction}
                disabled={isAnyActionLoading}
              >
                {isAnyActionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
