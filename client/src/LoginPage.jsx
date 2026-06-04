import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_HOST = 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_HOST}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card glass-panel">
        <div className="brand-header">
          <div className="logo-glow">N</div>
          <h2>Agency NFC Tools</h2>
          <p>Scan analytics and dynamic device manager</p>
        </div>

        {error && (
          <div className="error-alert">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="glass-input with-icon"
                placeholder="you@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className="glass-input with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="demo-notes">
          <span>Demo Access:</span>
          <code>admin@agency.com / admin123</code>
        </div>
      </div>

      <style>{`
        .login-layout {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1.5rem;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
        }
        .brand-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-glow {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary), var(--accent-cyan));
          color: white;
          font-weight: 800;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--primary-glow);
          margin-bottom: 0.5rem;
        }
        .brand-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .brand-header p {
          color: var(--text-secondary);
          font-size: 0.85rem;
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
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .glass-input.with-icon {
          padding-left: 2.75rem;
        }
        .submit-btn {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.85rem;
        }
        .demo-notes {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 1rem;
        }
        .demo-notes code {
          background: rgba(255,255,255,0.05);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          color: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
}
