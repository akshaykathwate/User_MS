import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
      />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          sidebarCollapsed={collapsed}
          onMobileMenuToggle={() => setMobileOpen(o => !o)}
        />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
