import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, getRevenueChartData, getCameraStatusData,
  STATUS_CONFIG, PLANS,
} from '../utils/helpers';

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ title, value, subtitle, icon, gradient, accentColor, onClick, trend, large }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '18px',
        padding: large ? '24px' : '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid #f0f4f8',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'; }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', marginTop: '6px' }}>
        {/* Icon */}
        <div style={{
          width: '46px', height: '46px', borderRadius: '14px',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${accentColor}33`,
        }}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '0.72rem', fontWeight: 700,
            color: trend >= 0 ? '#16a34a' : '#dc2626',
            background: trend >= 0 ? '#f0fdf4' : '#fff1f2',
            border: `1px solid ${trend >= 0 ? '#bbf7d0' : '#fecdd3'}`,
            padding: '3px 8px', borderRadius: '9999px',
          }}>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trend >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ fontSize: large ? '2rem' : '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginTop: '5px' }}>{title}</div>
      {subtitle && (
        <div style={{
          fontSize: '0.73rem', color: '#94a3b8', marginTop: '8px',
          paddingTop: '8px', borderTop: '1px solid #f8fafc',
        }}>{subtitle}</div>
      )}
    </div>
  );
}

/* ─── Mini Stat ──────────────────────────────────────────────── */
function MiniStat({ label, value, color, icon }) {
  return (
    <div style={{
      background: 'white', borderRadius: '14px', padding: '16px 18px',
      border: '1px solid #f0f4f8',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── Camera Feed Card ───────────────────────────────────────── */
function CameraFeedCard({ cam }) {
  const isOnline = cam.status === 'online';
  const isOffline = cam.status === 'offline';
  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      background: '#0a0f1e',
      border: `1px solid ${isOnline ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
      boxShadow: isOnline ? '0 4px 16px rgba(59,130,246,0.1)' : '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'transform 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Feed area */}
      <div style={{
        aspectRatio: '16/9', position: 'relative',
        background: isOnline
          ? 'linear-gradient(135deg, #0d1b3e 0%, #1e3a8a 60%, #1e40af 100%)'
          : 'linear-gradient(135deg, #111 0%, #1c1c1c 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Scan lines effect */}
        {isOnline && (
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)',
          }} />
        )}
        {/* Camera icon */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24"
            stroke={isOnline ? '#60a5fa' : '#374151'} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Corner indicators */}
        {isOnline && (
          <>
            <div style={{ position: 'absolute', top: 6, left: 6, width: 10, height: 10, borderTop: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6', borderRadius: '1px 0 0 0', opacity: 0.7 }} />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderTop: '2px solid #3b82f6', borderRight: '2px solid #3b82f6', borderRadius: '0 1px 0 0', opacity: 0.7 }} />
            <div style={{ position: 'absolute', bottom: 6, left: 6, width: 10, height: 10, borderBottom: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6', borderRadius: '0 0 0 1px', opacity: 0.7 }} />
            <div style={{ position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderBottom: '2px solid #3b82f6', borderRight: '2px solid #3b82f6', borderRadius: '0 0 1px 0', opacity: 0.7 }} />
          </>
        )}
        {/* Status chip */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          borderRadius: '6px', padding: '3px 7px',
          border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : isOffline ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: isOnline ? '#10b981' : isOffline ? '#ef4444' : '#f59e0b',
            animation: isOnline ? 'blink 2s infinite' : 'none',
          }} />
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em',
            color: isOnline ? '#10b981' : isOffline ? '#ef4444' : '#f59e0b',
          }}>
            {isOnline ? 'LIVE' : isOffline ? 'OFFLINE' : 'MAINT'}
          </span>
        </div>
        {/* Timestamp */}
        {isOnline && (
          <div style={{
            position: 'absolute', bottom: 6, left: 8,
            fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
          }}>
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px', background: '#0a0f1e' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cam.name}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cam.type} · {cam.resolution}
        </div>
      </div>
    </div>
  );
}

/* ─── Recent Alerts ──────────────────────────────────────────── */
function RecentAlerts({ alerts, onResolve, onViewAll }) {
  const items = alerts.filter(a => !a.resolved).slice(0, 4);
  const sevColor = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' };
  const typeIcon = { motion: '🎥', offline: '📵', storage: '💾', payment: '💳' };

  return (
    <div style={{ background: 'white', borderRadius: '18px', padding: '22px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#fef3c7,#fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            🔔
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Peringatan Aktif</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{items.length} belum diselesaikan</div>
          </div>
        </div>
        {items.length > 0 && (
          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', border: '1px solid #fecaca' }}>
            {items.length} Baru
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Semua aman, tidak ada peringatan</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(alert => (
            <div key={alert.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '12px',
              background: `${sevColor[alert.severity]}06`,
              border: `1px solid ${sevColor[alert.severity]}18`,
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                background: `${sevColor[alert.severity]}14`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
              }}>
                {typeIcon[alert.type] || '⚡'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.message}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>{alert.time?.split(' ')[1] || alert.time}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', background: `${sevColor[alert.severity]}18`, color: sevColor[alert.severity], textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {alert.severity}
                </span>
                <button onClick={() => onResolve(alert.id)} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                  Selesai
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onViewAll} style={{ marginTop: '14px', width: '100%', padding: '9px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.78rem', color: '#475569', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        Lihat Semua Peringatan
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

/* ─── Recent Transactions ────────────────────────────────────── */
function RecentTransactions({ payments, onViewAll }) {
  const recent = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const statusStyle = {
    success: { dot: '#10b981', bg: '#f0fdf4', text: '#16a34a', label: 'Berhasil' },
    pending: { dot: '#f59e0b', bg: '#fffbeb', text: '#d97706', label: 'Menunggu' },
    failed: { dot: '#ef4444', bg: '#fff1f2', text: '#dc2626', label: 'Gagal' },
    expired: { dot: '#94a3b8', bg: '#f8fafc', text: '#64748b', label: 'Kadaluarsa' },
  };

  return (
    <div style={{ background: 'white', borderRadius: '18px', padding: '22px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            💳
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Transaksi Terbaru</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pembayaran terakhir masuk</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {recent.map((p, idx) => {
          const s = statusStyle[p.status] || statusStyle.failed;
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 4px',
              borderBottom: idx < recent.length - 1 ? '1px solid #f8fafc' : 'none',
            }}>
              {/* Avatar */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 800, color: s.text,
              }}>
                {p.customerName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.customerName}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>{p.invoiceNo}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.text }}>{formatCurrency(p.amount)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{s.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onViewAll} style={{ marginTop: '14px', width: '100%', padding: '9px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.78rem', color: '#475569', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        Lihat Semua Transaksi
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────── */
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, cameras, payments, alerts, resolveAlert, subscriptions, customers } = useData();

  const revenueData = getRevenueChartData(payments);
  const cameraStatusData = getCameraStatusData(cameras);

  const planDistribution = Object.entries(PLANS).map(([key, plan]) => ({
    name: plan.name,
    value: customers.filter(c => c.plan === key && c.status === 'active').length,
    fill: key === 'basic' ? '#3b82f6' : key === 'premium' ? '#8b5cf6' : '#f59e0b',
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const now = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const onlineRate = stats.totalCameras > 0 ? Math.round((stats.onlineCameras / stats.totalCameras) * 100) : 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: '22px', overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1e40af 100%)',
        minHeight: '140px',
      }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Glow circles */}
          <div style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)' }} />
          <div style={{ position: 'absolute', right: '18%', top: '-20%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(147,197,253,0.07)', border: '1px solid rgba(147,197,253,0.1)' }} />
          <div style={{ position: 'absolute', right: '5%', bottom: '-30%', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.08)' }} />
          {/* House icon watermark */}
          <svg style={{ position: 'absolute', right: '3%', top: '50%', transform: 'translateY(-50%)', opacity: 0.06 }} width="200" height="200" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'blink 2s infinite' }} />
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Dashboard Jaga Rumah
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>{now}</span>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>Sistem berjalan normal</span>
            </div>
          </div>

          {/* Quick stats inside banner */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Kamera Aktif', value: `${stats.onlineCameras}/${stats.totalCameras}`, icon: '🎥', color: '#60a5fa' },
              { label: 'Pengguna', value: stats.activeCustomers, icon: '👥', color: '#a78bfa' },
              { label: 'Revenue', value: formatCurrency(stats.monthlyRevenue), icon: '💰', color: '#34d399' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '14px', padding: '14px 18px', textAlign: 'center', minWidth: '100px',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: item.color, lineHeight: 1.1 }}>{item.value}</div>
                <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Stat Cards (4 col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <StatCard
          title="Total Kamera"
          value={stats.totalCameras}
          subtitle={`${stats.onlineCameras} online · ${stats.offlineCameras} offline · ${stats.maintenanceCameras} maint`}
          gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
          accentColor="#3b82f6"
          trend={12}
          onClick={() => navigate('/cameras')}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalCustomers}
          subtitle={`${stats.activeCustomers} aktif · ${stats.totalCustomers - stats.activeCustomers} tidak aktif`}
          gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          accentColor="#8b5cf6"
          trend={8}
          onClick={() => navigate('/customers')}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${formatCurrency(stats.monthlyRevenue)} bulan ini`}
          gradient="linear-gradient(135deg,#10b981,#34d399)"
          accentColor="#10b981"
          trend={15}
          onClick={() => navigate('/payments')}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Langganan Aktif"
          value={stats.activeSubscriptions}
          subtitle={`${stats.pendingPayments} pembayaran menunggu`}
          gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"
          accentColor="#f59e0b"
          trend={5}
          onClick={() => navigate('/subscriptions')}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
        />
      </div>

      {/* ── Secondary Mini Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <MiniStat label="Kamera Online" value={`${onlineRate}%`} color="#06b6d4" icon="📡" />
        <MiniStat label="Kamera Offline" value={stats.offlineCameras} color="#ef4444" icon="⚠️" />
        <MiniStat label="Peringatan Aktif" value={stats.unresolvedAlerts} color="#f59e0b" icon="🚨" />
        <MiniStat label="Maintenance" value={stats.maintenanceCameras} color="#8b5cf6" icon="🔧" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
        {/* Revenue Area Chart */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Pendapatan 6 Bulan Terakhir</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Revenue dari semua paket langganan</div>
            </div>
            <div style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px' }}>
              +15% MoM
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} width={36} />
              <Tooltip
                formatter={v => [formatCurrency(v), 'Pendapatan']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.78rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: 'white', stroke: '#3b82f6', strokeWidth: 2.5, r: 4 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Camera Status + Plan Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Camera Donut */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '20px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Status Kamera</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <PieChart width={80} height={80}>
                <Pie data={cameraStatusData} cx={36} cy={36} innerRadius={22} outerRadius={36} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {cameraStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cameraStatusData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, boxShadow: `0 0 6px ${d.fill}` }} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Distribution bars */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '20px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Distribusi Paket</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {planDistribution.map(d => {
                const pct = stats.activeCustomers > 0 ? (d.value / stats.activeCustomers) * 100 : 0;
                return (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.fill }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{d.value} pengguna</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: d.fill, borderRadius: '9999px', transition: 'width 0.6s ease', boxShadow: `0 0 8px ${d.fill}66` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alerts + Transactions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <RecentAlerts alerts={alerts} onResolve={resolveAlert} onViewAll={() => navigate('/alerts')} />
        <RecentTransactions payments={payments} onViewAll={() => navigate('/payments')} />
      </div>

      {/* ── CCTV Live Grid ── */}
      <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg,#0f172a,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Monitoring CCTV</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{stats.onlineCameras} live</span>
                {' · '}
                {stats.totalCameras} total kamera
              </div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/cameras')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Kelola Semua
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
          {cameras.slice(0, 6).map(cam => (
            <CameraFeedCard key={cam.id} cam={cam} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
