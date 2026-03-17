import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/common/Toast';

const severityConfig = {
  high: { label: 'Tinggi', color: '#ef4444', bg: '#fee2e2' },
  medium: { label: 'Sedang', color: '#f59e0b', bg: '#fef3c7' },
  low: { label: 'Rendah', color: '#3b82f6', bg: '#dbeafe' },
};

const typeConfig = {
  motion: { label: 'Gerakan', icon: '🎥', color: '#6366f1' },
  offline: { label: 'Kamera Offline', icon: '⚠️', color: '#ef4444' },
  storage: { label: 'Penyimpanan', icon: '💾', color: '#f59e0b' },
  payment: { label: 'Pembayaran', icon: '💳', color: '#8b5cf6' },
  tamper: { label: 'Gangguan', icon: '🚨', color: '#dc2626' },
};

function Alerts() {
  const { alerts, resolveAlert, clearAlerts } = useData();
  const toast = useToast();
  const [filterType, setFilterType] = useState('all');
  const [filterResolved, setFilterResolved] = useState('unresolved');

  const filtered = alerts
    .filter(a => filterType === 'all' || a.type === filterType)
    .filter(a => filterResolved === 'all' || (filterResolved === 'resolved' ? a.resolved : !a.resolved))
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  const handleResolve = (id) => {
    resolveAlert(id);
    toast.success('Peringatan ditandai selesai');
  };

  const handleClearAll = () => {
    clearAlerts();
    toast.success('Semua peringatan diselesaikan');
  };

  const unresolved = alerts.filter(a => !a.resolved).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pusat Peringatan</h1>
          <p className="page-subtitle">
            {unresolved > 0 ? `${unresolved} peringatan belum diselesaikan` : 'Semua peringatan sudah diselesaikan'}
          </p>
        </div>
        {unresolved > 0 && (
          <button className="btn btn-success" onClick={handleClearAll}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selesaikan Semua
          </button>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Semua Peringatan', value: alerts.length, color: '#3b82f6', icon: '🔔' },
          { label: 'Belum Diselesaikan', value: unresolved, color: '#ef4444', icon: '🚨' },
          { label: 'Sudah Diselesaikan', value: alerts.filter(a => a.resolved).length, color: '#10b981', icon: '✅' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Semua Tipe</option>
          {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
          {[['unresolved', 'Belum Selesai'], ['resolved', 'Sudah Selesai'], ['all', 'Semua']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterResolved(v)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: filterResolved === v ? 'white' : 'none', color: filterResolved === v ? '#1e293b' : '#64748b', boxShadow: filterResolved === v ? 'var(--shadow-sm)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>Tidak Ada Peringatan</p>
            <p style={{ fontSize: '0.875rem' }}>Semua sistem berjalan normal</p>
          </div>
        ) : (
          <div>
            {filtered.map((alert, index) => {
              const type = typeConfig[alert.type] || { label: alert.type, icon: '⚡', color: '#64748b' };
              const sev = severityConfig[alert.severity] || severityConfig.low;
              return (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: index < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                    background: alert.resolved ? 'white' : `${sev.bg}20`,
                    opacity: alert.resolved ? 0.65 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                    background: sev.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>
                    {type.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{alert.message}</span>
                      {alert.resolved && (
                        <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#16a34a', padding: '1px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                          Selesai
                        </span>
                      )}
                    </div>
                    {alert.cameraName && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                        📹 {alert.cameraName}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{alert.time}</span>
                      <span style={{ fontSize: '0.72rem', background: sev.bg, color: sev.color, padding: '1px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                        {sev.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: `${type.color}15`, color: type.color, padding: '1px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                        {type.label}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="btn btn-success btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Selesaikan
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;
