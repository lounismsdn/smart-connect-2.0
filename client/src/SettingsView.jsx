import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Save, Check } from 'lucide-react';

export default function SettingsView({ user, token }) {
  const [showToken, setShowToken] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    // Simulate password change success
    setSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="settings-container">
      <div className="view-header">
        <div>
          <h1 className="title-gradient">Account Settings</h1>
          <p>Configure dashboard security credentials, API keys, and partner configurations</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card glass-panel">
          <h3>
            <Shield size={18} /> Credentials & Access
          </h3>
          
          <div className="profile-details">
            <div className="details-row">
              <span className="label">Registered Email</span>
              <span className="val">{user.email}</span>
            </div>
            <div className="details-row">
              <span className="label">Role Permission</span>
              <span className="val badge">{user.role === 'agency_admin' ? 'Agency Administrator' : 'Client Access Partner'}</span>
            </div>
            {user.company_name && (
              <div className="details-row">
                <span className="label">Assigned Company</span>
                <span className="val">{user.company_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* API Tokens */}
        <div className="settings-card glass-panel">
          <h3>
            <Key size={18} /> Agency API Secret
          </h3>
          <p className="description">Use this secret bearer token to query metrics or configure short links programmatically outside this dashboard.</p>
          
          <div className="token-wrapper">
            <input
              type={showToken ? 'text' : 'password'}
              className="glass-input token-input"
              value={token}
              readOnly
            />
            <button type="button" className="btn btn-secondary toggle-btn" onClick={() => setShowToken(!showToken)}>
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Password Reset */}
        <div className="settings-card glass-panel large">
          <h3>Update Password</h3>
          {success && (
            <div className="success-alert">
              <Check size={18} />
              <span>Password updated successfully.</span>
            </div>
          )}
          
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="glass-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="glass-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary submit-btn">
              <Save size={16} /> Update Password
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
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
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .settings-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .settings-card.large {
          grid-column: span 2;
        }
        .settings-card h3 {
          font-size: 1.05rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.75rem;
        }
        
        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .details-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .details-row .label {
          color: var(--text-muted);
        }
        .details-row .val {
          color: var(--text-primary);
        }
        .details-row .val.badge {
          background: rgba(6, 182, 212, 0.1);
          color: var(--accent-cyan);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .description {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .token-wrapper {
          display: flex;
          gap: 0.5rem;
        }
        .token-input {
          font-family: monospace;
          font-size: 0.8rem;
          background: rgba(0,0,0,0.2);
        }
        
        /* Form styling */
        .password-form {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .password-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .password-form label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .password-form .submit-btn {
          grid-column: span 2;
          width: fit-content;
          justify-self: end;
          margin-top: 0.5rem;
        }

        .success-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #a7f3d0;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
