import React, { useState, useEffect } from 'react';
import { Plus, Download, Radio, QrCode, Trash2, Edit2, Check, RefreshCw, Smartphone } from 'lucide-react';

export default function StandsView({ token, user }) {
  const [stands, setStands] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals / Editors
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStand, setEditingStand] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('redirect');
  const [targetUrl, setTargetUrl] = useState('');
  const [backupUrl, setBackupUrl] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  // NFC Writing State
  const [writingNfcId, setWritingNfcId] = useState(null);
  const [nfcMessage, setNfcMessage] = useState('');

  const isAdmin = user.role === 'agency_admin';
  const API_HOST = 'http://localhost:5000';
  const APP_URL = window.location.origin;

  const fetchStands = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/stands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStands(data.stands || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${API_HOST}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchStands(), fetchClients()]).then(() => setLoading(false));
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !targetUrl) return;

    try {
      const res = await fetch(`${API_HOST}/api/stands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          type,
          target_url: targetUrl,
          backup_url: type === 'review_filter' ? backupUrl : null,
          client_id: selectedClientId || null
        })
      });
      
      if (res.ok) {
        setIsCreateOpen(false);
        // Clear fields
        setName('');
        setTargetUrl('');
        setBackupUrl('');
        setSelectedClientId('');
        fetchStands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingStand) return;

    try {
      const res = await fetch(`${API_HOST}/api/stands/${editingStand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingStand.name,
          type: editingStand.type,
          target_url: editingStand.target_url,
          backup_url: editingStand.backup_url,
          client_id: editingStand.client_id
        })
      });

      if (res.ok) {
        setEditingStand(null);
        fetchStands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stand?')) return;
    try {
      const res = await fetch(`${API_HOST}/api/stands/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchStands();
    } catch (err) {
      console.error(err);
    }
  };

  // Program tag using Web NFC API
  const writeNfcTag = async (stand) => {
    // Generate the URL to write (usually the short redirect link)
    const writeUrl = `${API_HOST}/r/${stand.short_code}?src=nfc`;

    if (!('NDEFReader' in window)) {
      setWritingNfcId(stand.id);
      setNfcMessage('Web NFC is not supported on this device. Please use Google Chrome on Android, or copy the link below into an NFC writer app like "NFC Tools" (available on iOS and Android Store).\n\nCopy URL:\n' + writeUrl);
      return;
    }

    try {
      setWritingNfcId(stand.id);
      setNfcMessage('Ready! Hold your NFC tag close to the back of your phone...');
      
      const ndef = new NDEFReader();
      await ndef.write(writeUrl);
      
      setNfcMessage('Success! NFC Tag programmed.');
      setTimeout(() => setWritingNfcId(null), 2500);
      
    } catch (err) {
      console.error('NFC Write Error:', err);
      setNfcMessage(`Error: ${err.message || 'Could not connect'}`);
    }
  };

  const getStandTypeLabel = (type) => {
    switch (type) {
      case 'redirect': return 'Direct Link';
      case 'review_filter': return 'Review Filter';
      case 'wifi': return 'Wi-Fi Stand';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="stands-loading">
        <div className="loader-ring"></div>
        <span>Loading stands catalog...</span>
      </div>
    );
  }

  return (
    <div className="stands-container">
      <div className="view-header">
        <div>
          <h1 className="title-gradient">Physical NFC Stands</h1>
          <p>Register, program, configure, and monitor your agency's smart review stands</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} /> Add New Stand
          </button>
        )}
      </div>

      <div className="stands-grid">
        {stands.map((stand) => {
          // Generate redirect URL
          const redirectUrl = `${API_HOST}/r/${stand.short_code}`;
          // Generate print-ready QR Code url
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=255-255-255&bgcolor=9-13-22&data=${encodeURIComponent(
            `${redirectUrl}?src=qr`
          )}`;

          const isEditing = editingStand && editingStand.id === stand.id;

          return (
            <div key={stand.id} className="stand-card glass-panel">
              <div className="card-header">
                <div>
                  <h3>{stand.name}</h3>
                  <span className="code-badge">Code: {stand.short_code}</span>
                </div>
                <div className="type-badge" data-type={stand.type}>
                  {getStandTypeLabel(stand.type)}
                </div>
              </div>

              {isEditing ? (
                // EDIT MODE
                <form onSubmit={handleUpdate} className="edit-form">
                  <div className="form-group">
                    <label>Stand Name</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={editingStand.name}
                      onChange={(e) => setEditingStand({ ...editingStand, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Target URL</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={editingStand.target_url}
                      placeholder={editingStand.type === 'wifi' ? 'SSID|Password' : 'https://google.com'}
                      onChange={(e) => setEditingStand({ ...editingStand, target_url: e.target.value })}
                      required
                    />
                  </div>
                  {editingStand.type === 'review_filter' && (
                    <div className="form-group">
                      <label>Negative Review Target / Feedback URL</label>
                      <input
                        type="text"
                        className="glass-input"
                        value={editingStand.backup_url || ''}
                        onChange={(e) => setEditingStand({ ...editingStand, backup_url: e.target.value })}
                      />
                    </div>
                  )}
                  {isAdmin && (
                    <div className="form-group">
                      <label>Assign to Client</label>
                      <select
                        className="glass-input glass-select"
                        value={editingStand.client_id || ''}
                        onChange={(e) => setEditingStand({ ...editingStand, client_id: e.target.value || null })}
                      >
                        <option value="">No Client (Internal)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.company_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="edit-actions">
                    <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingStand(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                // VIEW MODE
                <div className="card-details">
                  <div className="info-row">
                    <span className="info-label">Redirect Link:</span>
                    <a href={redirectUrl} target="_blank" rel="noreferrer" className="redirect-link">
                      {redirectUrl.replace(/^https?:\/\//i, '')}
                    </a>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Destination:</span>
                    <span className="info-val truncate">{stand.target_url}</span>
                  </div>
                  {isAdmin && (
                    <div className="info-row">
                      <span className="info-label">Assigned Client:</span>
                      <span className="info-val">{stand.client_name || 'Unassigned'}</span>
                    </div>
                  )}

                  {/* QR Code and NFC Action triggers */}
                  <div className="stand-visual-preview">
                    <div className="qr-preview-box">
                      <img src={qrCodeUrl} alt="Stand QR" className="qr-thumbnail" />
                      <a href={qrCodeUrl} download={`qr_${stand.short_code}.png`} target="_blank" rel="noreferrer" className="qr-download-link">
                        <Download size={14} /> QR
                      </a>
                    </div>
                    <div className="nfc-program-box">
                      <button type="button" className="btn btn-secondary program-btn" onClick={() => writeNfcTag(stand)}>
                        <Smartphone size={16} /> Program NFC
                      </button>
                    </div>
                  </div>

                  {/* NFC Feedback overlay */}
                  {writingNfcId === stand.id && (
                    <div className="nfc-feedback-overlay glass-panel">
                      <p>{nfcMessage}</p>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWritingNfcId(null)}>Close</button>
                    </div>
                  )}

                  <div className="card-footer">
                    <button type="button" className="action-btn-text edit" onClick={() => setEditingStand(stand)}>
                      <Edit2 size={14} /> Edit Configuration
                    </button>
                    {isAdmin && (
                      <button type="button" className="action-btn-text delete" onClick={() => handleDelete(stand.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL (Admin Only) */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <h2>Add New Smart Stand</h2>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Stand / Table Identifier</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Reception Desk Review"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stand Behavior / Type</label>
                <select className="glass-input glass-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="redirect">Direct Link (Social, Web, Linktree)</option>
                  <option value="review_filter">Google Review Filter (Positive Review Redirector)</option>
                  <option value="wifi">Wi-Fi Connect (Auto-configure settings)</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  {type === 'wifi' ? 'Wi-Fi Network Name (SSID)' : 'Primary Destination URL'}
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder={type === 'wifi' ? 'e.g. My Cafe Wi-Fi' : 'e.g. https://google.com/...'}
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />
              </div>

              {type === 'review_filter' && (
                <div className="form-group">
                  <label>Negative Review Target / Support Form URL (Optional)</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="URL or leave blank for internal feedback form"
                    value={backupUrl}
                    onChange={(e) => setBackupUrl(e.target.value)}
                  />
                </div>
              )}

              {type === 'wifi' && (
                <div className="form-group">
                  <label>Wi-Fi Password</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="WPA password"
                    value={backupUrl}
                    onChange={(e) => setBackupUrl(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Allocate to Client Account</label>
                <select
                  className="glass-input glass-select"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">Keep for Agency (Internal)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create Stand</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .stands-container {
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
        
        .stands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 1.5rem;
        }
        .stand-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 0.75rem;
        }
        .card-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .code-badge {
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255,255,255,0.03);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          display: inline-block;
          margin-top: 0.25rem;
        }
        .type-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
        }
        .type-badge[data-type='redirect'] {
          background: rgba(59, 130, 246, 0.15);
          color: #93c5fd;
        }
        .type-badge[data-type='review_filter'] {
          background: rgba(168, 85, 247, 0.15);
          color: #d8b4fe;
        }
        .type-badge[data-type='wifi'] {
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
        }
        
        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          gap: 1rem;
        }
        .info-label {
          color: var(--text-muted);
          font-weight: 600;
        }
        .info-val {
          color: var(--text-primary);
          font-weight: 600;
          text-align: right;
        }
        .redirect-link {
          color: var(--accent-cyan);
          text-decoration: none;
          font-weight: 600;
        }
        .redirect-link:hover {
          text-decoration: underline;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        
        /* QR & NFC Previews */
        .stand-visual-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(0,0,0,0.15);
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.03);
          margin-top: 0.5rem;
        }
        .qr-preview-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
        }
        .qr-thumbnail {
          width: 64px;
          height: 64px;
          border-radius: 4px;
        }
        .qr-download-link {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-weight: 600;
        }
        .qr-download-link:hover {
          color: var(--text-primary);
        }
        .nfc-program-box {
          flex-grow: 1;
        }
        .program-btn {
          width: 100%;
          font-size: 0.8rem;
          padding: 0.5rem;
        }
        
        /* NFC Overlay */
        .nfc-feedback-overlay {
          position: absolute;
          inset: 0.5rem;
          background: rgba(15, 23, 42, 0.95);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 1rem;
          z-index: 10;
          animation: fadeIn 0.2s ease;
        }
        .nfc-feedback-overlay p {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.4;
          white-space: pre-line;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 0.75rem;
        }
        .action-btn-text {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .action-btn-text.edit { color: var(--text-secondary); }
        .action-btn-text.edit:hover { color: var(--text-primary); }
        .action-btn-text.delete { color: #f87171; }
        .action-btn-text.delete:hover { color: #ef4444; }

        /* Form styling */
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .edit-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .edit-form label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .edit-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: scaleUp 0.2s ease;
        }
        .modal-content h2 {
          font-size: 1.35rem;
          font-weight: 800;
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .modal-form label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .stands-loading {
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
