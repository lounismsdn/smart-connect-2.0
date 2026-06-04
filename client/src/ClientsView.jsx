import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Briefcase, Eye, ShieldAlert } from 'lucide-react';

export default function ClientsView({ token }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Registration Form
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  const API_HOST = 'http://localhost:5000';

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !companyName) return;
    setError('');

    try {
      const res = await fetch(`${API_HOST}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          password,
          company_name: companyName,
          primary_color: primaryColor
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client user.');
      }

      setIsRegisterOpen(false);
      setEmail('');
      setPassword('');
      setCompanyName('');
      setPrimaryColor('#3b82f6');
      fetchClients();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client account? All assigned stands will be unassigned.')) return;
    try {
      const res = await fetch(`${API_HOST}/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="clients-loading">
        <div className="loader-ring"></div>
        <span>Loading client database...</span>
      </div>
    );
  }

  return (
    <div className="clients-container">
      <div className="view-header">
        <div>
          <h1 className="title-gradient">Client Accounts</h1>
          <p>Create and manage dashboard access portals for your agency's clients</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsRegisterOpen(true)}>
          <Plus size={18} /> Register Client Account
        </button>
      </div>

      <div className="clients-grid">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="client-card glass-panel">
              <div className="card-top">
                <div className="client-branding-dot" style={{ backgroundColor: client.primary_color }}></div>
                <div>
                  <h3>{client.company_name}</h3>
                  <span className="client-id-label">Client User</span>
                </div>
              </div>

              <div className="card-body">
                <div className="meta-row">
                  <Mail size={14} className="meta-icon" />
                  <span>{client.email}</span>
                </div>
                <div className="meta-row">
                  <Briefcase size={14} className="meta-icon" />
                  <span>Registered: {new Date(client.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions">
                <button type="button" className="action-btn-text delete" onClick={() => handleDelete(client.id)}>
                  <Trash2 size={14} /> Delete Account
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-clients-panel glass-panel">
            <Briefcase size={36} color="var(--text-muted)" />
            <p>No client accounts registered yet. Click the button above to register your first partner.</p>
          </div>
        )}
      </div>

      {/* REGISTER CLIENT MODAL */}
      {isRegisterOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <h2>Register Client Account</h2>
            {error && (
              <div className="error-alert">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleRegister} className="modal-form">
              <div className="form-group">
                <label>Company / Client Name</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Skyline Bar & Grill"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Login Email</label>
                <input
                  type="email"
                  className="glass-input"
                  placeholder="client@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Portal Password</label>
                <input
                  type="password"
                  className="glass-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Client Branding Color (Theme)</label>
                <div className="color-selector">
                  <input
                    type="color"
                    className="color-input"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <span className="color-value-text">{primaryColor.toUpperCase()}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create Account</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .clients-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .view-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .view-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        
        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .client-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 0.75rem;
        }
        .client-branding-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
        }
        .card-top h3 {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .client-id-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        
        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .meta-icon {
          color: var(--text-muted);
        }
        
        .card-actions {
          margin-top: auto;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 0.75rem;
        }
        .action-btn-text.delete { color: #f87171; }
        .action-btn-text.delete:hover { color: #ef4444; }
        
        .empty-clients-panel {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
          text-align: center;
          color: var(--text-muted);
        }
        .empty-clients-panel p {
          max-width: 400px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Color Picker */
        .color-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15,23,42,0.8);
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .color-input {
          border: none;
          background: none;
          width: 32px;
          height: 32px;
          cursor: pointer;
          border-radius: 4px;
        }
        .color-value-text {
          font-family: monospace;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .clients-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
          color: var(--text-secondary);
        }
        .loader-ring {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.05);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }
      `}</style>
    </div>
  );
}
