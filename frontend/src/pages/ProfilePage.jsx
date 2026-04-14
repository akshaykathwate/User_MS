import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/services';
import toast from 'react-hot-toast';
import { MdPerson, MdLock, MdEdit, MdSave, MdCancel, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { format } from '../utils/helpers';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({ name: user?.name || '' });
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!profileData.name.trim() || profileData.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (changingPassword) {
      if (!passwordData.password || passwordData.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (passwordData.password !== passwordData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const updates = { name: profileData.name };
      if (changingPassword && passwordData.password) {
        updates.password = passwordData.password;
      }
      await usersAPI.update(user._id, updates);
      await refreshUser();
      toast.success('Profile updated successfully!');
      setEditMode(false);
      setChangingPassword(false);
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setChangingPassword(false);
    setProfileData({ name: user?.name || '' });
    setPasswordData({ password: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and password</p>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <div className="user-detail-avatar" style={{ width: 72, height: 72, fontSize: 'var(--text-2xl)' }}>
            {format.initials(user?.name)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{user?.name}</h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              <span className={`badge badge-${user?.status}`}>{user?.status}</span>
            </div>
          </div>
          {!editMode && (
            <button id="edit-profile-btn" className="btn btn-primary" onClick={() => setEditMode(true)}>
              <MdEdit size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="section-title"><MdPerson size={18} style={{ color: 'var(--color-primary)' }} /> Personal Information</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="profile-name">Full Name <span className="required">*</span></label>
          <input
            id="profile-name"
            type="text"
            className={`form-control ${errors.name ? 'error' : ''}`}
            value={profileData.name}
            onChange={e => { setProfileData(d => ({ ...d, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
            disabled={!editMode || loading}
            placeholder="Your full name"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            value={user?.email || ''}
            disabled
            style={{ opacity: 0.6 }}
          />
          <small style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Email cannot be changed by users</small>
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <input
            type="text"
            className="form-control"
            value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
            disabled
            style={{ opacity: 0.6, textTransform: 'capitalize' }}
          />
          <small style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Role is managed by administrators</small>
        </div>
      </div>

      {/* Password Change */}
      {editMode && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 className="section-title" style={{ margin: 0 }}><MdLock size={18} style={{ color: 'var(--color-primary)' }} /> Change Password</h2>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={changingPassword}
                onChange={e => { setChangingPassword(e.target.checked); setPasswordData({ password: '', confirmPassword: '' }); setErrors(er => ({ ...er, password: '', confirmPassword: '' })); }}
              />
              <span className="checkbox-label">Update password</span>
            </label>
          </div>

          {changingPassword && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password <span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    id="new-password"
                    type={showPass ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    value={passwordData.password}
                    onChange={e => { setPasswordData(d => ({ ...d, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                    placeholder="Minimum 6 characters"
                    disabled={loading}
                  />
                  <span className="input-toggle" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm Password <span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    value={passwordData.confirmPassword}
                    onChange={e => { setPasswordData(d => ({ ...d, confirmPassword: e.target.value })); setErrors(er => ({ ...er, confirmPassword: '' })); }}
                    placeholder="Re-enter new password"
                    disabled={loading}
                  />
                  <span className="input-toggle" onClick={() => setShowConfirm(s => !s)}>
                    {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      {editMode && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button id="save-profile-btn" className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving...</> : <><MdSave size={16} /> Save Changes</>}
          </button>
          <button className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
            <MdCancel size={16} /> Cancel
          </button>
        </div>
      )}

      {/* Audit Info */}
      {!editMode && (
        <div className="card">
          <h2 className="section-title">📋 Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Member Since</div>
              <div className="info-item-value">{format.dateTime(user?.createdAt)}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Last Updated</div>
              <div className="info-item-value">{format.dateTime(user?.updatedAt)}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Account ID</div>
              <div className="info-item-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user?._id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
