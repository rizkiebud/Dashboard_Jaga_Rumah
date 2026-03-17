import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateTime, getRevenueChartData, getCameraStatusData, STATUS_CONFIG, PLANS } from '../utils/helpers';

// Stat Card Component
function StatCard({ title, value, subtitle, icon, color, onClick, trend }) {
  return (
    <div className="stat-card" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: color, display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.75rem', fontWeight: 600,
            color: trend >= 0 ? '#16a34a' : '#dc2626',
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trend >= 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );
}

// CCTV Status Grid
function CCTVGrid({ cameras, onViewAll }) {
  const displayed = cameras.slice(0, 6);
  return (
    <div style={{
      background: 'white', borderRadius: '16px',
      padding: '24px', boxShadow: 'var(--shadow)',
      border: '1px solid var(--gray-200)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Monitoring CCTV</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Live status semua kamera</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onViewAll}>
          Lihat Semua
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {displayed.map(cam => (
          <div key={cam.id} style={{
            background: '#0f172a', borderRadius: '12px',
            overflow: 'hidden', position: 'relative',
          }}>
            {/* Feed placeholder */}
            <div style={{
              aspectRatio: '16/9',
              background: `linear-gradient(135deg, #0f172a, ${cam.status === 'online' ? '#1e3a8a' : '#1c1c1c'})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={cam.status === 'online' ? '#3b82f6' : '#374151'} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {cam.status === 'online' && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 6px',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'blink 2s infinite' }} />
                  <span style={{ color: '#10b981', fontSize: '0.65rem', fontWeight: 600 }}>LIVE</span>
                </div>
              )}
              {cam.status === 'offline' && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(239,68,68,0.8)', borderRadius: 4, padding: '2px 6px',
                }}>
                  <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>OFFLINE</span>
                </div>
              )}
              {cam.status === 'maintenance' && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(245,158,11,0.8)', borderRadius: 4, padding: '2px 6px',
                }}>
                  <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>MAINT</span>
                </div>
              )}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cam.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cam.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Alerts
function RecentAlerts({ alerts, onResolve }) {
  const unresolved = alerts.filter(a => !a.resolved).slice(0, 5);
  const severityColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' };
  const typeIcons = {
    motion: '🎥',
    offline: '⚠️',
    storage: '💾',
    payment: '💳',
  };

  return (
    <div style={{
      background: 'white', borderRadius: '16px',
      padding: '24px', boxShadow: 'var(--shadow)',
      border: '1px solid var(--gray-200)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Peringatan Terbaru</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{unresolved.length} belum diselesaikan</p>
        </div>
        {unresolved.length > 0 && (
          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>
            {unresolved.length} Baru
          </span>
        )}
      </div>

      {unresolved.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Semua peringatan sudah diselesaikan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {unresolved.map(alert => (
            <div key={alert.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '10px',
              background: '#fafafa', border: '1px solid #f1f5f9',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${severityColors[alert.severity]}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                {typeIcons[alert.type] || '⚡'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{alert.message}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{alert.time}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{
                  background: `${severityColors[alert.severity]}20`,
                  color: severityColors[alert.severity],
                  fontSize: '0.65rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase',
                }}>
                  {alert.severity}
                </span>
                <button
                  onClick={() => onResolve(alert.id)}
                  style={{
                    background: 'none', border: '1px solid #e2e8f0',
                    borderRadius: '6px', padding: '3px 8px',
                    fontSize: '0.7rem', color: '#64748b', cursor: 'pointer',
                  }}
                >
                  Selesaikan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Recent Transactions
function RecentTransactions({ payments }) {
  const recent = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  return (
    <div style={{
      background: 'white', borderRadius: '16px',
      padding: '24px', boxShadow: 'var(--shadow)',
      border: '1px solid var(--gray-200)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Transaksi Terbaru</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Aktivitas pembayaran terakhir</p>
        </div>
      </div>
      <div>
        {recent.map(p => {
          const sc = STATUS_CONFIG.payment[p.status] || {};
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', borderBottom: '1px solid #f8fafc',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: p.status === 'success' ? '#dcfce7' : p.status === 'pending' ? '#fef3c7' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                {p.status === 'success' ? '✅' : p.status === 'pending' ? '⏳' : '❌'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{p.customerName}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.invoiceNo} · {p.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: p.status === 'success' ? '#16a34a' : p.status === 'pending' ? '#d97706' : '#dc2626' }}>
                  {formatCurrency(p.amount)}
                </div>
                <span className={`badge ${sc.className}`} style={{ fontSize: '0.65rem' }}>{sc.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0891b2 100%)',
        borderRadius: '20px', padding: '28px 32px', marginBottom: '28px',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-30px', opacity: 0.08 }}>
          <svg width="200" height="200" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={0.5}>
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div style={{ position: 'relative' }}>
          <p style={{ opacity: 0.8, fontSize: '0.875rem', marginBottom: 6 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Dashboard Jaga Rumah</h2>
          <p style={{ opacity: 0.75, fontSize: '0.9rem' }}>
            Senin, 17 Maret 2025 · Sistem berjalan normal ·
            <span style={{ fontWeight: 600, marginLeft: 6 }}>{stats.onlineCameras} dari {stats.totalCameras} kamera aktif</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          title="Total Kamera"
          value={stats.totalCameras}
          subtitle={`${stats.onlineCameras} online · ${stats.offlineCameras} offline`}
          icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          color="rgba(59,130,246,0.12)"
          trend={12}
          onClick={() => navigate('/cameras')}
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalCustomers}
          subtitle={`${stats.activeCustomers} pengguna aktif`}
          icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          color="rgba(139,92,246,0.12)"
          trend={8}
          onClick={() => navigate('/customers')}
        />
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${formatCurrency(stats.monthlyRevenue)} bulan ini`}
          icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="rgba(16,185,129,0.12)"
          trend={15}
          onClick={() => navigate('/payments')}
        />
        <StatCard
          title="Langganan Aktif"
          value={stats.activeSubscriptions}
          subtitle={`${stats.pendingPayments} pembayaran menunggu`}
          icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
          color="rgba(245,158,11,0.12)"
          trend={5}
          onClick={() => navigate('/subscriptions')}
        />
        <StatCard
          title="Kamera Online"
          value={`${Math.round((stats.onlineCameras / stats.totalCameras) * 100)}%`}
          subtitle={`${stats.onlineCameras} kamera berjalan normal`}
          icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#06b6d4" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>}
          color="rgba(6,182,212,0.12)"
        />
        <StatCard
          title="Peringatan Aktif"
          value={stats.unresolvedAlerts}
          subtitle="Memerlukan perhatian"
          icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          color="rgba(239,68,68,0.12)"
          onClick={() => navigate('/alerts')}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Revenue Chart */}
        <div className="chart-container">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Pendapatan 6 Bulan Terakhir</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Revenue dari semua paket langganan</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Pendapatan']} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Camera & Plan Distribution */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
          {/* Camera Status Pie */}
          <div className="chart-container" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Status Kamera</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <PieChart width={90} height={90}>
                <Pie data={cameraStatusData} cx={40} cy={40} innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">
                  {cameraStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {cameraStatusData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="chart-container" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Distribusi Paket</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {planDistribution.map(d => (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{d.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{d.value} pengguna</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${stats.activeCustomers > 0 ? (d.value / stats.activeCustomers) * 100 : 0}%`,
                      background: d.fill,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <RecentAlerts alerts={alerts} onResolve={resolveAlert} />
        <RecentTransactions payments={payments} />
      </div>

      {/* CCTV Grid */}
      <CCTVGrid cameras={cameras} onViewAll={() => navigate('/cameras')} />
    </div>
  );
}

export default Dashboard;
