import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import Sidebar from './Sidebar';
import MetricsView from './MetricsView';
import StandsView from './StandsView';
import ClientsView from './ClientsView';
import SettingsView from './SettingsView';
import FeedbackPage from './FeedbackPage';
import WifiPage from './WifiPage';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Custom router state based on window location pathname
  const [routeInfo, setRouteInfo] = useState({ path: window.location.pathname });

  useEffect(() => {
    // Listen for backward/forward navigation changes
    const handleLocationChange = () => {
      setRouteInfo({ path: window.location.pathname });
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setRouteInfo({ path });
  };

  useEffect(() => {
    // Skip fetching user profile if we are displaying a public landing page
    if (routeInfo.path.startsWith('/feedback/') || routeInfo.path.startsWith('/wifi/')) {
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    // Validate token and fetch current user details
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // Clear expired session
        localStorage.removeItem('token');
        setToken('');
        setLoading(false);
      });
  }, [token, routeInfo.path]);

  const handleLoginSuccess = (newToken, loggedInUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    // Optional: ping server logout
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => console.error(err));

    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  // --- PUBLIC PATH ROUTING ---
  
  if (routeInfo.path.startsWith('/feedback/')) {
    const shortCode = routeInfo.path.split('/')[2];
    return <FeedbackPage shortCode={shortCode} />;
  }

  if (routeInfo.path.startsWith('/wifi/')) {
    const shortCode = routeInfo.path.split('/')[2];
    return <WifiPage shortCode={shortCode} />;
  }

  // --- PRIVATE PATH ROUTING ---

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loader-circle"></div>
        <span>Authenticating session...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MetricsView token={token} user={user} />;
      case 'stands':
        return <StandsView token={token} user={user} />;
      case 'clients':
        return user.role === 'agency_admin' ? (
          <ClientsView token={token} />
        ) : (
          <MetricsView token={token} user={user} />
        );
      case 'settings':
        return <SettingsView token={token} user={user} />;
      default:
        return <MetricsView token={token} user={user} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />
      <main className="app-main-content">
        <div className="content-scroller">
          {renderActiveView()}
        </div>
      </main>

      <style>{`
        .app-loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1.5rem;
          color: var(--text-secondary);
        }
        .loader-circle {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.05);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .app-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        .app-main-content {
          flex-grow: 1;
          height: 100vh;
          overflow-y: auto;
          padding: 1.5rem 2.5rem;
        }
        .content-scroller {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
