import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/services';
import {
  MdPeople, MdVerifiedUser, MdPersonOff, MdAdminPanelSettings,
  MdSupervisorAccount, MdPerson, MdArrowForward, MdAdd
} from 'react-icons/md';
import { format } from '../utils/helpers';

const DashboardPage = () => {
  const { user, isAdmin, isAdminOrManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdminOrManager) {
      usersAPI.getStats()
        .then(({ data }) => setStats(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdminOrManager]);

  const getRoleCount = (role) => {
    if (!stats?.byRole) return 0;
    return stats.byRole.find(r => r._id === role)?.count || 0;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {isAdminOrManager ? 'System Dashboard' : 'My Dashboard'}
        </h1>
        <p className="page-subtitle">
          Welcome back, <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{user?.name}</span>{' '}
          — <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
        </p>
      </div>

      {isAdminOrManager && (
        <>
          {loading ? (
            <div className="loading-container">
              <div className="spinner" style={{ width: 40, height: 40 }} />
              <span>Loading dashboard...</span>
            </div>
          ) : (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-icon purple"><MdPeople /></div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.total ?? 0}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><MdVerifiedUser /></div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.active ?? 0}</div>
                    <div className="stat-label">Active Users</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon red"><MdPersonOff /></div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.inactive ?? 0}</div>
                    <div className="stat-label">Inactive Users</div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="stat-card">
                    <div className="stat-icon yellow"><MdAdminPanelSettings /></div>
                    <div className="stat-content">
                      <div className="stat-value">{getRoleCount('admin')}</div>
                      <div className="stat-label">Admins</div>
                    </div>
                  </div>
                )}
                <div className="stat-card">
                  <div className="stat-icon blue"><MdSupervisorAccount /></div>
                  <div className="stat-content">
                    <div className="stat-value">{getRoleCount('manager')}</div>
                    <div className="stat-label">Managers</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon cyan"><MdPerson /></div>
                  <div className="stat-content">
                    <div className="stat-value">{getRoleCount('user')}</div>
                    <div className="stat-label">Regular Users</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                {isAdmin && (
                  <Link to="/users/create" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', cursor: 'pointer' }}>
                    <div className="stat-icon purple"><MdAdd /></div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>Create New User</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Add a user to the system</div>
                    </div>
                    <MdArrowForward style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                  </Link>
                )}
                <Link to="/users" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', cursor: 'pointer' }}>
                  <div className="stat-icon blue"><MdPeople /></div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>View All Users</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Manage and search users</div>
                  </div>
                  <MdArrowForward style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </Link>
              </div>

              {stats?.recentUsers?.length > 0 && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>Recently Added Users</h2>
                    <Link to="/users" className="btn btn-ghost btn-sm">View All</Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {stats.recentUsers.map(u => (
                      <Link
                        key={u._id}
                        to={`/users/${u._id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', transition: 'background 0.15s', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <div className="user-avatar">{u.name[0].toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div className="user-name">{u.name}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                        <span className={`badge badge-${u.status}`}>{u.status}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{format.date(u.createdAt)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!isAdminOrManager && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', maxWidth: 600 }}>
          <Link to="/profile" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="stat-icon purple" style={{ marginBottom: 'var(--space-4)' }}><MdPerson /></div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)', marginBottom: 4 }}>My Profile</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>View and update your profile details</div>
          </Link>
          <div className="card">
            <div className="stat-icon cyan" style={{ marginBottom: 'var(--space-4)' }}><MdVerifiedUser /></div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)', marginBottom: 4 }}>Account Status</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <span className={`badge badge-${user?.status}`}>{user?.status}</span>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
