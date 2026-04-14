import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdMenu } from 'react-icons/md';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of the system' },
  '/users': { title: 'User Management', subtitle: 'Manage all users and their roles' },
  '/users/create': { title: 'Create User', subtitle: 'Add a new user to the system' },
  '/profile': { title: 'My Profile', subtitle: 'View and update your profile' },
};

const Topbar = ({ sidebarCollapsed, onMobileMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageInfo = () => {
    const exact = pageTitles[location.pathname];
    if (exact) return exact;
    if (location.pathname.startsWith('/users/')) return { title: 'User Details', subtitle: 'View user information' };
    return { title: 'UserMS', subtitle: 'User Management System' };
  };

  const { title, subtitle } = getPageInfo();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={onMobileMenuToggle}
          style={{ display: 'none' }}
          id="mobile-menu-toggle"
        >
          <MdMenu size={20} />
        </button>
        <div className="topbar-left">
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">{subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">{getInitials(user?.name)}</div>
          <div className="topbar-user-info">
            <div className="topbar-user-name">{user?.name}</div>
            <div className="topbar-user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
