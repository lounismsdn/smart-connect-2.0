import React, { useState, useEffect } from 'react';
import { Wifi, Copy, Check, Info, AlertTriangle } from 'lucide-react';

export default function WifiPage({ shortCode }) {
  const [stand, setStand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const API_HOST = 'http://localhost:5000';

  useEffect(() => {
    // Fetch public stand details
    fetch(`${API_HOST}/api/public/stands/${shortCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invalid stand code');
        return res.json();
      })
      .then((data) => {
        setStand(data.stand);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('We couldn\'t load this page. Please try scanning the QR code again.');
        setLoading(false);
      });
  }, [shortCode]);

  // Parse credentials from target_url (Format: SSID|PASSWORD|SECURITY or standard target_url text)
  const getWifiDetails = () => {
    if (!stand || !stand.target_url) return { ssid: 'Guest Network', password: '', security: 'WPA' };
    
    const parts = stand.target_url.split('|');
    if (parts.length >= 2) {
      return {
        ssid: parts[0].trim(),
        password: parts[1].trim(),
        security: parts[2] ? parts[2].trim() : 'WPA'
      };
    }
    
    // Fallback if client just put standard text
    return {
      ssid: stand.target_url,
      password: stand.backup_url || '',
      security: 'WPA'
    };
  };

  const handleCopyPassword = () => {
    const details = getWifiDetails();
    if (!details.password) return;
    
    navigator.clipboard.writeText(details.password)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy password:', err));
  };

  if (loading) {
    return (
      <div className="wifi-layout">
        <div className="wifi-card glass-panel loading-shimmer">
          <div className="shimmer-circle"></div>
          <div className="shimmer-line text"></div>
          <div className="shimmer-line text"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wifi-layout">
        <div className="wifi-card glass-panel error-card">
          <AlertTriangle size={48} color="#ef4444" />
          <h2>Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { ssid, password, security } = getWifiDetails();
  // Standard format for Wi-Fi QR code: WIFI:S:SSID;T:WPA;P:PASSWORD;;
  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=255-255-255&bgcolor=15-23-42&data=${encodeURIComponent(
    `WIFI:S:${ssid};T:${security};P:${password};;`
  )}`;

  return (
    <div className="wifi-layout">
      <div className="wifi-card glass-panel">
        <div className="wifi-icon-ring pulse-glow">
          <Wifi size={40} color="#06b6d4" />
        </div>

        <h1 className="title-gradient">Instant Wi-Fi Connection</h1>
        <p className="subtitle">Scan the QR code below to connect automatically, or copy the password.</p>

        {password && (
          <div className="qr-container">
            <img src={wifiQrUrl} alt="Wi-Fi QR Code" className="wifi-qr" />
            <span className="qr-caption">Scan with Camera to Auto-Connect</span>
          </div>
        )}

        <div className="credentials-box">
          <div className="credential-row">
            <span className="label">Network (SSID)</span>
            <span className="value">{ssid}</span>
          </div>
          {password && (
            <div className="credential-row">
              <span className="label">Password</span>
              <div className="password-wrapper">
                <span className="value password-text">{password}</span>
                <button type="button" className="copy-btn" onClick={handleCopyPassword}>
                  {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="info-tip">
          <Info size={16} color="#94a3b8" />
          <span>If auto-connect fails, connect manually using the details above.</span>
        </div>
      </div>

      <style>{`
        .wifi-layout {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1.5rem;
        }
        .wifi-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .wifi-icon-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.4;
        }
        .qr-container {
          background: rgba(15, 23, 42, 0.5);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .wifi-qr {
          width: 160px;
          height: 160px;
          border-radius: 8px;
          border: 2px solid rgba(255,255,255,0.05);
        }
        .qr-caption {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .credentials-box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.4);
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.03);
          text-align: left;
        }
        .credential-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .credential-row .label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .credential-row .value {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .password-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .info-tip {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          text-align: left;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.3;
        }
        
        /* Loading Shimmer style overrides */
        .loading-shimmer {
          height: 340px;
          justify-content: center;
          gap: 1.5rem;
        }
        .shimmer-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .shimmer-line.text { width: 75%; height: 16px; }
      `}</style>
    </div>
  );
}
