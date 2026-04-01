import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, getRevenueChartData, PLANS,
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

/* ─── Emergency Quick Card ───────────────────────────────────── */
const CAT_META = {
  police:   { icon: '🚔', color: '#3b82f6', label: 'Kepolisian' },
  fire:     { icon: '🚒', color: '#ef4444', label: 'Pemadam' },
  medical:  { icon: '🚑', color: '#10b981', label: 'Medis' },
  security: { icon: '💂', color: '#8b5cf6', label: 'Keamanan' },
  disaster: { icon: '🆘', color: '#f59e0b', label: 'Bencana' },
  other:    { icon: '📞', color: '#64748b', label: 'Lainnya' },
};

function EmergencyQuickCard({ contact, onDial }) {
  const cat = CAT_META[contact.category] || CAT_META.other;
  const priColor = contact.priority === 1 ? '#ef4444' : contact.priority === 2 ? '#f59e0b' : '#10b981';
  return (
    <div style={{
      background: 'white', borderRadius: '14px', padding: '16px',
      border: `1px solid ${cat.color}22`,
      boxShadow: `0 2px 8px ${cat.color}10`,
      display: 'flex', alignItems: 'center', gap: '12px',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${cat.color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 8px ${cat.color}10`; }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: `${cat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
      }}>
        {cat.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {contact.name}
          </div>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: priColor, flexShrink: 0 }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{contact.phone}</div>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>{cat.label}</div>
      </div>
      <button
        onClick={() => onDial(contact)}
        style={{
          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${cat.color}44`, transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
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
  const { stats, payments, alerts, resolveAlert, customers, emergencies, recordCall } = useData();
  const [dialContact, setDialContact] = React.useState(null);

  const revenueData = getRevenueChartData(payments);

  const planDistribution = Object.entries(PLANS).map(([key, plan]) => ({
    name: plan.name,
    value: customers.filter(c => c.plan === key && c.status === 'active').length,
    fill: key === 'basic' ? '#3b82f6' : key === 'premium' ? '#8b5cf6' : '#f59e0b',
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const now = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Emergency data
  const activeEmergencies = (emergencies || []).filter(e => e.status === 'active');
  const priorityOne = (emergencies || []).filter(e => e.priority === 1 && e.status === 'active');
  const topContacts = [...(emergencies || [])].filter(e => e.status === 'active').sort((a, b) => a.priority - b.priority).slice(0, 6);

  const catCounts = (emergencies || []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  const handleDial = (contact) => {
    setDialContact(contact);
  };
  const confirmDial = () => {
    if (dialContact) {
      recordCall(dialContact.id);
      setDialContact(null);
    }
  };

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
              { label: 'Emergency Aktif', value: activeEmergencies.length, icon: '🚨', color: '#f87171' },
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
          title="Kontak Darurat"
          value={(emergencies || []).length}
          subtitle={`${activeEmergencies.length} aktif · ${priorityOne.length} prioritas utama`}
          gradient="linear-gradient(135deg,#ef4444,#f87171)"
          accentColor="#ef4444"
          trend={null}
          onClick={() => navigate('/emergency')}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
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
        <MiniStat label="Emergency Aktif" value={activeEmergencies.length} color="#ef4444" icon="🚨" />
        <MiniStat label="Prioritas Utama" value={priorityOne.length} color="#f59e0b" icon="🔴" />
        <MiniStat label="Peringatan Sistem" value={stats.unresolvedAlerts} color="#f59e0b" icon="⚠️" />
        <MiniStat label="Total Panggilan" value={stats.totalCalls || 0} color="#8b5cf6" icon="📞" />
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

        {/* Emergency Category + Plan Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Emergency Category breakdown */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '20px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Kategori Emergency</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(CAT_META).map(([key, meta]) => {
                const count = catCounts[key] || 0;
                const total = (emergencies || []).length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem' }}>{meta.icon}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>{meta.label}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{count}</span>
                    </div>
                    <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
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

      {/* ── Emergency Quick Access ── */}
      <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Kontak Darurat Cepat</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>{priorityOne.length} prioritas utama</span>
                {' · '}
                {activeEmergencies.length} kontak aktif
              </div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/emergency')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Kelola Semua
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {topContacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📞</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Belum ada kontak darurat</div>
            <button onClick={() => navigate('/emergency')} style={{ marginTop: '12px', padding: '8px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Tambah Kontak
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {topContacts.map(contact => (
              <EmergencyQuickCard key={contact.id} contact={contact} onDial={handleDial} />
            ))}
          </div>
        )}
      </div>

      {/* ── Dial Confirmation Modal ── */}
      {dialContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '340px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{CAT_META[dialContact.category]?.icon || '📞'}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{dialContact.name}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginBottom: '6px', letterSpacing: '0.05em' }}>{dialContact.phone}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '24px' }}>{CAT_META[dialContact.category]?.label}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDialContact(null)} style={{ padding: '10px 24px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                Batal
              </button>
              <button onClick={confirmDial} style={{ padding: '10px 24px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#ef4444,#f87171)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Hubungi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
