import { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../components/Toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingEntrepreneurs, setPendingEntrepreneurs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: '', id: null, email: '' });
  const toast = useToast();

  const getErrorMessage = (err) => {
    if (err.response && err.response.data) {
      const errorData = err.response.data;
      if (typeof errorData === 'string') {
        return errorData;
      } else if (errorData.title) {
        return errorData.title;
      }
    }
    return 'An unexpected error occurred.';
  };

  const fetchPendingEntrepreneurs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getPendingEntrepreneurs();
      setPendingEntrepreneurs(response.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingEntrepreneurs();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminService.approveEntrepreneur(id);
      toast.success('Entrepreneur approved successfully!');
      fetchPendingEntrepreneurs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
      setConfirmDialog({ show: false, type: '', id: null, email: '' });
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminService.rejectEntrepreneur(id);
      toast.success('Entrepreneur rejected and account deleted successfully!');
      fetchPendingEntrepreneurs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
      setConfirmDialog({ show: false, type: '', id: null, email: '' });
    }
  };

  const openConfirmDialog = (type, id, email) => {
    setConfirmDialog({ show: true, type, id, email });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, type: '', id: null, email: '' });
  };

  const confirmAction = () => {
    if (confirmDialog.type === 'approve') {
      handleApprove(confirmDialog.id);
    } else if (confirmDialog.type === 'reject') {
      handleReject(confirmDialog.id);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage pending entrepreneur approvals.</p>
          </div>
          <button 
            className="btn-refresh" 
            onClick={fetchPendingEntrepreneurs}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="table-container">
        <h3>Pending Entrepreneurs ({pendingEntrepreneurs.length})</h3>
        {isLoading ? (
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
                      onClick={() => openConfirmDialog('approve', entrepreneur.id, entrepreneur.email)}
                      disabled={actionLoading === entrepreneur.id}
                    >
                      {actionLoading === entrepreneur.id ? '...' : 'Approve'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => openConfirmDialog('reject', entrepreneur.id, entrepreneur.email)}
                      disabled={actionLoading === entrepreneur.id}
                    >
                      {actionLoading === entrepreneur.id ? '...' : 'Reject'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmDialog.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm {confirmDialog.type === 'approve' ? 'Approval' : 'Rejection'}</h3>
            <p>
              {confirmDialog.type === 'approve' 
                ? `Are you sure you want to approve ${confirmDialog.email}? They will be able to log in after this.`
                : `Are you sure you want to reject ${confirmDialog.email}? This will permanently delete their account.`
              }
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={closeConfirmDialog}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className={confirmDialog.type === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : (confirmDialog.type === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
