import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
