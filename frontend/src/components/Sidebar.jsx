import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdPeople, MdPerson, MdLogout,
  MdChevronLeft, MdChevronRight, MdMenu, MdShield
} from 'react-icons/md';

const Sidebar = ({ collapsed, onToggle, mobileOpen }) => {
  const { user, logout, isAdmin, isAdminOrManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <MdDashboard />, to: '/dashboard', show: true },
    { label: 'Users', icon: <MdPeople />, to: '/users', show: isAdminOrManager },
    { label: 'My Profile', icon: <MdPerson />, to: '/profile', show: true },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <MdShield />
        </div>
        {!collapsed && <span className="sidebar-logo-text">UserMS</span>}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Navigation</div>}

        {navItems.filter(item => item.show).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-item-text">{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && isAdmin && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 12 }}>Admin</div>
            <div
              className="sidebar-item"
              style={{ cursor: 'default', opacity: 0.5 }}
              title="Role: Admin"
            >
              <span className="sidebar-icon"><MdShield /></span>
              <span className="sidebar-item-text">Admin Mode</span>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--color-surface-2)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        )}

        <button className="sidebar-toggle" onClick={handleLogout}>
          <span className="sidebar-icon"><MdLogout /></span>
          {!collapsed && <span>Logout</span>}
        </button>

        <button className="sidebar-toggle" onClick={onToggle} style={{ marginTop: 4, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <span className="sidebar-icon">
            {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
