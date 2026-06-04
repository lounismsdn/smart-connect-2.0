import React, { useState, useEffect } from 'react';
import { BarChart3, Smartphone, MapPin, RefreshCw, Radio, QrCode } from 'lucide-react';

export default function MetricsView({ token }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_HOST = 'http://localhost:5000';

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(`${API_HOST}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  // Render inline SVG Line Chart
  const renderTimelineChart = () => {
    if (!metrics || !metrics.timelineStats || metrics.timelineStats.length === 0) {
      return (
        <div className="no-chart-data">
          <span>No scan data recorded in the last 30 days.</span>
        </div>
      );
    }

    const data = metrics.timelineStats;
    const maxVal = Math.max(...data.map(d => d.count), 5); // Fallback to 5 to avoid flat chart
    const width = 500;
    const height = 150;
    const padding = 15;

    const points = data.map((d, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - (d.count * (height - padding * 2)) / maxVal;
      return { x, y, date: d.date, count: d.count };
    });

    const pathData = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Path for gradient fill below line
    const areaData = points.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={padding} y1={(height) / 2} x2={width - padding} y2={(height) / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Gradient area */}
          {areaData && <path d={areaData} fill="url(#chartGlow)" />}

          {/* Graph Line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive points */}
          {points.map((p, i) => (
            <g key={i} className="chart-dot-group">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ffffff"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <title>{`${p.date}: ${p.count} scans`}</title>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="metrics-loading">
        <div className="loader-ring"></div>
        <span>Gathering metrics...</span>
      </div>
    );
  }

  const nfcCount = metrics.referrerStats.find(r => r.referrer === 'NFC')?.count || 0;
  const qrCount = metrics.referrerStats.find(r => r.referrer === 'QR')?.count || 0;
  const totalScansCalculated = nfcCount + qrCount || metrics.totalScans || 1;

  const nfcPercentage = Math.round((nfcCount / totalScansCalculated) * 100) || 0;
  const qrPercentage = Math.round((qrCount / totalScansCalculated) * 100) || 0;

  return (
    <div className="metrics-container">
      <div className="view-header">
        <div>
          <h1 className="title-gradient">Scan Analytics</h1>
          <p>Real-time client scans, device diagnostics, and user engagements</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary refresh-btn"
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">Total Scans</span>
            <BarChart3 size={20} color="#06b6d4" />
          </div>
          <span className="kpi-value glow-text-cyan">{metrics.totalScans}</span>
          <span className="kpi-trend positive">All-time active records</span>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">Stands Enrolled</span>
            <Radio size={20} color="#a855f7" />
          </div>
          <span className="kpi-value glow-text-purple">{metrics.totalStands}</span>
          <span className="kpi-trend">
            {metrics.activeStands} actively scanning ({Math.round((metrics.activeStands / (metrics.totalStands || 1)) * 100)}%)
          </span>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">NFC Taps</span>
            <Radio size={20} color="#10b981" />
          </div>
          <span className="kpi-value" style={{ color: '#10b981' }}>{nfcCount}</span>
          <span className="kpi-trend">{nfcPercentage}% of all interactions</span>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">QR Code Scans</span>
            <QrCode size={20} color="#f59e0b" />
          </div>
          <span className="kpi-value" style={{ color: '#f59e0b' }}>{qrCount}</span>
          <span className="kpi-trend">{qrPercentage}% of all interactions</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Timeline Chart */}
        <div className="chart-panel glass-panel large">
          <h3>Scan Volume (Last 30 Days)</h3>
          {renderTimelineChart()}
        </div>

        {/* Operating Systems */}
        <div className="chart-panel glass-panel">
          <h3>
            <Smartphone size={18} /> OS Breakdown
          </h3>
          <div className="stat-list">
            {metrics.osStats.length > 0 ? (
              metrics.osStats.map((item, idx) => {
                const pct = Math.round((item.count / (metrics.totalScans || 1)) * 100);
                return (
                  <div key={idx} className="stat-row">
                    <div className="stat-info">
                      <span className="stat-label">{item.os}</span>
                      <span className="stat-val">{item.count} ({pct}%)</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--primary)' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="no-data">No data logged</span>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="chart-panel glass-panel">
          <h3>
            <MapPin size={18} /> Top Locations (Cities)
          </h3>
          <div className="stat-list">
            {metrics.locationStats.length > 0 ? (
              metrics.locationStats.map((item, idx) => {
                const pct = Math.round((item.count / (metrics.totalScans || 1)) * 100);
                return (
                  <div key={idx} className="stat-row">
                    <div className="stat-info">
                      <span className="stat-label">{item.city}, {item.country}</span>
                      <span className="stat-val">{item.count} ({pct}%)</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--accent-purple)' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="no-data">No locations logged</span>
            )}
          </div>
        </div>

        {/* Interaction Ratio */}
        <div className="chart-panel glass-panel">
          <h3>Interaction Methods</h3>
          <div className="ratio-container">
            <div className="ratio-bars">
              <div className="ratio-bar qr" style={{ width: `${qrPercentage}%` }}></div>
              <div className="ratio-bar nfc" style={{ width: `${nfcPercentage}%` }}></div>
            </div>
            <div className="ratio-legend">
              <div className="legend-item">
                <span className="dot qr"></span>
                <span>QR ({qrPercentage}%)</span>
              </div>
              <div className="legend-item">
                <span className="dot nfc"></span>
                <span>NFC ({nfcPercentage}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .metrics-container {
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
        .refresh-btn {
          height: fit-content;
        }
        .spinning {
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* KPI cards grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .kpi-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kpi-title {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1;
        }
        .kpi-trend {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .kpi-trend.positive {
          color: var(--accent-cyan);
        }

        /* Charts grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .chart-panel {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .chart-panel.large {
          grid-column: span 2;
        }
        .chart-panel h3 {
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }
        .chart-wrapper {
          width: 100%;
          height: 160px;
        }
        .chart-dot-group:hover circle {
          r: 6;
          fill: var(--text-primary);
        }
        .no-chart-data {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          background: rgba(0,0,0,0.1);
          border-radius: 8px;
          border: 1px dashed rgba(255,255,255,0.05);
        }

        /* Stat lists */
        .stat-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .stat-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .stat-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .stat-label {
          color: var(--text-secondary);
        }
        .stat-val {
          color: var(--text-primary);
        }
        .bar-bg {
          height: 6px;
          background: rgba(255,255,255,0.04);
          border-radius: 3px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease-in-out;
        }

        /* Ratio Bar */
        .ratio-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          justify-content: center;
          height: 100%;
        }
        .ratio-bars {
          display: flex;
          height: 24px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
        }
        .ratio-bar.qr { background: #f59e0b; }
        .ratio-bar.nfc { background: #10b981; }
        .ratio-legend {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .legend-item .dot.qr { background: #f59e0b; }
        .legend-item .dot.nfc { background: #10b981; }

        .no-data {
          color: var(--text-muted);
          font-size: 0.85rem;
          text-align: center;
          padding: 2rem 0;
        }

        /* Metrics Loading state */
        .metrics-loading {
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
