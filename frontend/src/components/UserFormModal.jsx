import { useState, useEffect } from 'react';
import { usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const UserFormModal = ({ user, isAdmin, isManager, onClose, onSaved }) => {
  const { user: currentUser } = useAuth();
  const isEdit = !!user;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    password: '',
    autoGeneratePassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatedPassword, setGeneratedPassword] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name required (min 2 chars)';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!isEdit && !form.autoGeneratePassword && (!form.password || form.password.length < 6)) {
      e.password = 'Password required (min 6 chars)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGeneratedPassword('');

    try {
      const payload = { name: form.name, email: form.email };
      if (isAdmin) {
        payload.role = form.role;
        payload.status = form.status;
      }
      if (!isEdit) {
        payload.autoGeneratePassword = form.autoGeneratePassword;
        if (!form.autoGeneratePassword) payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      let res;
      if (isEdit) {
        res = await usersAPI.update(user._id, payload);
        toast.success('User updated successfully!');
      } else {
        res = await usersAPI.create(payload);
        if (res.data.data.generatedPassword) {
          setGeneratedPassword(res.data.data.generatedPassword);
          toast.success('User created! Note the generated password.');
          return; // Wait for user to close manually
        }
        toast.success('User created successfully!');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(e => { apiErrors[e.field] = e.message; });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !generatedPassword && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Create New User'}</h2>
          <button className="modal-close" onClick={() => generatedPassword ? onSaved() : onClose()}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Generated Password Display */}
        {generatedPassword && (
          <div>
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              ✅ User created successfully! Share the generated password with the user.
            </div>
            <div className="password-generated">
              <div className="password-generated-label">⚠️ Generated Password — Copy now, it won't be shown again:</div>
              <div className="password-generated-value">{generatedPassword}</div>
            </div>
            <div className="modal-actions" style={{ borderTop: 'none', paddingTop: 16 }}>
              <button className="btn btn-primary" onClick={onSaved}>Done</button>
            </div>
          </div>
        )}

        {/* Form */}
        {!generatedPassword && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-name">Full Name <span className="required">*</span></label>
              <input
                id="modal-name"
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                placeholder="Full name"
                disabled={loading}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modal-email">Email Address <span className="required">*</span></label>
              <input
                id="modal-email"
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                placeholder="user@example.com"
                disabled={loading || (isEdit && isManager)}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {isAdmin && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-role">Role</label>
                  <select
                    id="modal-role"
                    className="form-control filter-select"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    disabled={loading}
                    style={{ width: '100%' }}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-status">Status</label>
                  <select
                    id="modal-status"
                    className="form-control filter-select"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    disabled={loading}
                    style={{ width: '100%' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password section */}
            {!isEdit && (
              <div className="form-group">
                <label className="checkbox-wrapper" style={{ marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={form.autoGeneratePassword}
                    onChange={e => setForm(f => ({ ...f, autoGeneratePassword: e.target.checked, password: '' }))}
                  />
                  <span className="checkbox-label">Auto-generate password</span>
                </label>

                {!form.autoGeneratePassword && (
                  <>
                    <label className="form-label" htmlFor="modal-password">Password <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <input
                        id="modal-password"
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'error' : ''}`}
                        value={form.password}
                        onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                        placeholder="Minimum 6 characters"
                        disabled={loading}
                      />
                      <span className="input-toggle" onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </span>
                    </div>
                    {errors.password && <div className="form-error">{errors.password}</div>}
                  </>
                )}
              </div>
            )}

            {isEdit && (
              <div className="form-group">
                <label className="form-label" htmlFor="modal-edit-password">New Password (leave blank to keep current)</label>
                <div className="input-wrapper">
                  <input
                    id="modal-edit-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter new password..."
                    disabled={loading}
                  />
                  <span className="input-toggle" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" id="modal-submit-btn" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />{isEdit ? 'Saving...' : 'Creating...'}</> : (isEdit ? 'Save Changes' : 'Create User')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserFormModal;
