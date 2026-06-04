import React from 'react';
import { BarChart3, Radio, Users, Settings, LogOut, Terminal } from 'lucide-react';

export default function Sidebar({ user, currentView, onViewChange, onLogout }) {
  const isAdmin = user.role === 'agency_admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'stands', label: 'NFC Stands', icon: Radio },
    ...(isAdmin ? [{ id: 'clients', label: 'Client Accounts', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Terminal size={22} color="#06b6d4" />
        </div>
        <div className="brand-info">
          <h2>{isAdmin ? 'Agency NFC' : (user.company_name || 'Client Hub')}</h2>
          <span>{isAdmin ? 'Admin Console' : 'Partner Portal'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="name">{isAdmin ? 'Agency Manager' : (user.company_name || 'Client')}</span>
            <span className="email">{user.email}</span>
          </div>
        </div>

        <button type="button" className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          height: calc(100vh - 2rem);
          margin: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          border-radius: 16px;
          position: sticky;
          top: 1rem;
          flex-shrink: 0;
        }
        
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .brand-logo {
          width: 36px;
          height: 36px;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .brand-info h2 {
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }
        
        .brand-info span {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex-grow: 1;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          width: 100%;
          padding: 0.8rem 1rem;
          background: none;
          border: none;
          border-radius: 10px;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 550;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(2px);
        }
        
        .nav-item.active {
          color: var(--text-primary);
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.02) 100%);
          border-left: 3px solid var(--primary);
          padding-left: calc(1rem - 3px);
        }
        
        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
          color: white;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .user-info .name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .user-info .email {
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.6rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          color: #fca5a5;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </aside>
  );
}
