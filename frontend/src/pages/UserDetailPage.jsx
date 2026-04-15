import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/services';
import toast from 'react-hot-toast';
import { MdArrowBack, MdEdit, MdPersonOff, MdDelete, MdShield } from 'react-icons/md';
import { format } from '../utils/helpers';
import UserFormModal from '../components/UserFormModal';
import ConfirmModal from '../components/ConfirmModal';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, isManager } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getById(id);
      setUser(data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleDeactivate = async () => {
    try {
      await usersAPI.deactivate(id);
      toast.success('User deactivated');
      setShowDeactivateModal(false);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await usersAPI.permanentDelete(id);
      toast.success('User permanently deleted');
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="loading-container"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
  );

  if (error) return (
    <div>
      <div className="alert alert-error">{error}</div>
      <Link to="/users" className="btn btn-secondary"><MdArrowBack /> Back to Users</Link>
    </div>
  );

  if (!user) return null;

  const canEdit = isAdmin || (isManager && user.role !== 'admin');
  const canDelete = isAdmin && currentUser._id !== id;

  return (
    <div>
      {(isAdmin || isManager) && (
        <Link to="/users" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-6)' }}>
          <MdArrowBack /> Back to Users
        </Link>
      )}

      <div className="user-detail-header">
        <div className="user-detail-avatar">{format.initials(user.name)}</div>
        <div className="user-detail-info">
          <h1 className="user-detail-name">{user.name}</h1>
          <div className="user-detail-email">{user.email}</div>
          <div className="user-detail-badges">
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            <span className={`badge badge-${user.status}`}>{user.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
          {canEdit && (
            <button id="edit-user-btn" className="btn btn-primary" onClick={() => setShowEditModal(true)}>
              <MdEdit size={16} /> Edit
            </button>
          )}
          {canDelete && user.status === 'active' && (
            <button className="btn btn-danger" onClick={() => setShowDeactivateModal(true)}>
              <MdPersonOff size={16} /> Deactivate
            </button>
          )}
          {canDelete && (
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              <MdDelete size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <div className="card">
          <h2 className="section-title"><MdShield size={18} style={{ color: 'var(--color-primary)' }} /> Account Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Full Name</div>
              <div className="info-item-value">{user.name}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Email Address</div>
              <div className="info-item-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{user.email}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Role</div>
              <div className="info-item-value"><span className={`badge badge-${user.role}`}>{user.role}</span></div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Status</div>
              <div className="info-item-value"><span className={`badge badge-${user.status}`}>{user.status}</span></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">📋 Audit Trail</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Created At</div>
              <div className="info-item-value">{format.dateTime(user.createdAt)}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Last Updated</div>
              <div className="info-item-value">{format.dateTime(user.updatedAt)}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Created By</div>
              <div className="info-item-value">
                {user.createdBy ? (
                  <span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{user.createdBy.name}</span>
                    <br />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user.createdBy.email}</span>
                  </span>
                ) : 'System / Self-registered'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Last Updated By</div>
              <div className="info-item-value">
                {user.updatedBy ? (
                  <span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{user.updatedBy.name}</span>
                    <br />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user.updatedBy.email}</span>
                  </span>
                ) : '—'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">User ID</div>
              <div className="info-item-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user._id}</div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <UserFormModal
          user={user}
          isAdmin={isAdmin}
          isManager={isManager}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); fetchUser(); }}
        />
      )}

      {showDeactivateModal && (
        <ConfirmModal
          title="Deactivate User"
          message={`Deactivate "${user.name}"? They will no longer be able to log in.`}
          confirmText="Deactivate"
          confirmClass="btn-danger"
          onConfirm={handleDeactivate}
          onClose={() => setShowDeactivateModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Permanently Delete User"
          message={`Permanently delete "${user.name}"? This cannot be undone.`}
          confirmText="Delete Permanently"
          confirmClass="btn-danger"
          onConfirm={handlePermanentDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default UserDetailPage;
