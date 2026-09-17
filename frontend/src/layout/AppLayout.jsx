import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden="true" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-column">
        <Navbar onMenu={() => setSidebarOpen(true)} />
        <main className="main-content"><Outlet /></main>
        <Footer />
      </div>
    </div>
  );
}
