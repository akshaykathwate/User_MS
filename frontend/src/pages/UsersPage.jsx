import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/services';
import toast from 'react-hot-toast';
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility,
  MdRefresh, MdPersonOff, MdFilterList
} from 'react-icons/md';
import { format } from '../utils/helpers';
import UserFormModal from '../components/UserFormModal';
import ConfirmModal from '../components/ConfirmModal';

const UsersPage = () => {
  const { isAdmin, isManager } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [searchInput, setSearchInput] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteType, setDeleteType] = useState('soft');

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;

      const { data } = await usersAPI.getAll(params);
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchUsers(1);
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDeactivate = async () => {
    try {
      await usersAPI.deactivate(deletingUser._id);
      toast.success('User deactivated successfully');
      setDeletingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await usersAPI.permanentDelete(deletingUser._id);
      toast.success('User permanently deleted');
      setDeletingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const onUserSaved = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    fetchUsers(pagination.page);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            {pagination.total} users total — Manage roles, status, and access
          </p>
        </div>
        {isAdmin && (
          <button
            id="create-user-btn"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <MdAdd size={18} /> Create User
          </button>
        )}
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Users</div>
          <div className="table-actions">
            <div className="search-bar">
              <span className="search-icon"><MdSearch /></span>
              <input
                id="user-search"
                type="text"
                className="form-control"
                placeholder="Search name or email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{ paddingLeft: 36, width: 220 }}
              />
            </div>

            <select
              id="role-filter"
              className="filter-select"
              value={filters.role}
              onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              {isAdmin && <option value="admin">Admin</option>}
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>

            <select
              id="status-filter"
              className="filter-select"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="btn btn-ghost btn-icon" onClick={() => fetchUsers(pagination.page)} title="Refresh">
              <MdRefresh size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <span>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No users found</div>
            <p className="empty-state-description">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{format.initials(user.name)}</div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td><span className={`badge badge-${user.status}`}>{user.status}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {format.date(user.createdAt)}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {user.createdBy?.name || 'System'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link
                          to={`/users/${user._id}`}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="View"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        {(isAdmin || (isManager && user.role !== 'admin')) && (
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Edit"
                            onClick={() => setEditingUser(user)}
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              title="Deactivate"
                              onClick={() => { setDeletingUser(user); setDeleteType('soft'); }}
                              disabled={user.status === 'inactive'}
                            >
                              <MdPersonOff size={16} />
                            </button>
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              title="Permanent Delete"
                              onClick={() => { setDeletingUser(user); setDeleteType('hard'); }}
                            >
                              <MdDelete size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >‹</button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - pagination.page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    className={`pagination-btn ${p === pagination.page ? 'active' : ''}`}
                    onClick={() => fetchUsers(p)}
                  >{p}</button>
                ))}
              <button
                className="pagination-btn"
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >›</button>
            </div>
          </div>
        )}
      </div>

      {(showCreateModal || editingUser) && (
        <UserFormModal
          user={editingUser}
          isAdmin={isAdmin}
          isManager={isManager}
          onClose={() => { setShowCreateModal(false); setEditingUser(null); }}
          onSaved={onUserSaved}
        />
      )}

      {deletingUser && (
        <ConfirmModal
          title={deleteType === 'soft' ? 'Deactivate User' : 'Permanently Delete User'}
          message={
            deleteType === 'soft'
              ? `Are you sure you want to deactivate "${deletingUser.name}"? They will no longer be able to log in.`
              : `Are you sure you want to permanently delete "${deletingUser.name}"? This action cannot be undone.`
          }
          confirmText={deleteType === 'soft' ? 'Deactivate' : 'Delete Permanently'}
          confirmClass={deleteType === 'hard' ? 'btn-danger' : 'btn-danger'}
          onConfirm={deleteType === 'soft' ? handleDeactivate : handlePermanentDelete}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
