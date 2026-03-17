import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useData } from '../context/DataContext';
import { formatCurrency, getRevenueChartData, getCameraStatusData, PLANS } from '../utils/helpers';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

function Reports() {
  const { cameras, customers, payments, subscriptions } = useData();
  const [period, setPeriod] = useState('6months');

  const revenueData = getRevenueChartData(payments);
  const cameraStatusData = getCameraStatusData(cameras);

  // Plan distribution
  const planData = Object.entries(PLANS).map(([key, plan]) => ({
    name: plan.name,
    pelanggan: customers.filter(c => c.plan === key).length,
    pendapatan: payments.filter(p => p.plan === key && p.status === 'success').reduce((a, b) => a + b.amount, 0),
    fill: COLORS[Object.keys(PLANS).indexOf(key)],
  }));

  // Payment method distribution
  const methodData = [
    { name: 'Transfer Bank', value: payments.filter(p => p.method === 'transfer_bank').length, fill: '#3b82f6' },
    { name: 'Virtual Account', value: payments.filter(p => p.method === 'virtual_account').length, fill: '#8b5cf6' },
    { name: 'E-Wallet', value: payments.filter(p => p.method === 'e_wallet').length, fill: '#f59e0b' },
    { name: 'QRIS', value: payments.filter(p => p.method === 'qris').length, fill: '#10b981' },
    { name: 'Kartu Kredit', value: payments.filter(p => p.method === 'credit_card').length, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  // Camera type distribution
  const cameraTypeData = [...new Set(cameras.map(c => c.type))].map(type => ({
    name: type,
    value: cameras.filter(c => c.type === type).length,
  }));

  // Monthly customer growth (mock)
  const growthData = revenueData.map((d, i) => ({
    ...d,
    pelangganBaru: Math.floor(Math.random() * 3) + 1,
    totalPelanggan: Math.max(1, customers.length - (revenueData.length - 1 - i) * 1),
  }));

  // Stats
  const totalRevenue = payments.filter(p => p.status === 'success').reduce((a, b) => a + b.amount, 0);
  const avgPerCustomer = customers.length > 0 ? totalRevenue / customers.length : 0;
  const successRate = payments.length > 0 ? (payments.filter(p => p.status === 'success').length / payments.length * 100).toFixed(1) : 0;
  const avgCamerasPerUser = customers.length > 0 ? (cameras.length / customers.length).toFixed(1) : 0;

  const kpiCards = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: 'Semua waktu', icon: '💰', color: '#10b981' },
    { label: 'Avg. Revenue/Pelanggan', value: formatCurrency(avgPerCustomer), sub: 'Per pelanggan', icon: '👤', color: '#3b82f6' },
    { label: 'Payment Success Rate', value: `${successRate}%`, sub: `${payments.filter(p => p.status === 'success').length} dari ${payments.length} transaksi`, icon: '✅', color: '#8b5cf6' },
    { label: 'Avg. Kamera/Pengguna', value: avgCamerasPerUser, sub: 'Rata-rata per akun', icon: '🎥', color: '#f59e0b' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan & Analitik</h1>
          <p className="page-subtitle">Data komprehensif sistem CCTV Jaga Rumah</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="1month">1 Bulan</option>
            <option value="3months">3 Bulan</option>
            <option value="6months">6 Bulan</option>
            <option value="1year">1 Tahun</option>
          </select>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {kpiCards.map(kpi => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>{kpi.icon}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue & Growth Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px', marginBottom: '16px' }}>
        <div className="chart-container">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Tren Pendapatan</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Revenue bulanan dari semua paket</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Pendapatan']} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad2)" dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Distribusi Paket</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Persentase pelanggan tiap paket</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="pelanggan" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {planData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={v => [v, 'Pelanggan']} contentStyle={{ borderRadius: '10px', fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* More charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Payment Methods */}
        <div className="chart-container">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Metode Pembayaran</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={methodData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                {methodData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={v => [v, 'Transaksi']} contentStyle={{ borderRadius: '10px', fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {methodData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Status */}
        <div className="chart-container">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Status Kamera</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cameraStatusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={v => [v, 'Kamera']} contentStyle={{ borderRadius: '10px', fontSize: '0.8rem' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {cameraStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Camera Types */}
        <div className="chart-container">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Tipe Kamera</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cameraTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [v, 'Jumlah']} contentStyle={{ borderRadius: '10px', fontSize: '0.8rem' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue per plan */}
      <div className="chart-container" style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Perbandingan Pendapatan per Paket</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total pendapatan yang dihasilkan dari setiap paket langganan</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={planData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
            <Tooltip formatter={(v, name) => [name === 'pendapatan' ? formatCurrency(v) : v, name === 'pendapatan' ? 'Pendapatan' : 'Pelanggan']} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
            <Legend iconType="circle" iconSize={8} formatter={v => v === 'pendapatan' ? 'Pendapatan' : 'Pelanggan'} />
            <Bar dataKey="pendapatan" name="pendapatan" radius={[6, 6, 0, 0]}>
              {planData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Ringkasan Performa</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Paket</th>
                <th>Pelanggan Aktif</th>
                <th>Total Kamera</th>
                <th>Limit Kamera</th>
                <th>Harga/bln</th>
                <th>Total Revenue</th>
                <th>% Revenue</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PLANS).map(([key, plan]) => {
                const activeSubs = subscriptions.filter(s => s.plan === key && s.status === 'active').length;
                const camCount = cameras.filter(c => c.subscription === key).length;
                const rev = payments.filter(p => p.plan === key && p.status === 'success').reduce((a, b) => a + b.amount, 0);
                const totalRev = payments.filter(p => p.status === 'success').reduce((a, b) => a + b.amount, 0);
                return (
                  <tr key={key}>
                    <td><span className={`badge ${plan.color}`}>{plan.name}</span></td>
                    <td style={{ fontWeight: 700 }}>{activeSubs}</td>
                    <td>{camCount}</td>
                    <td>{plan.cameraLimit}</td>
                    <td>{formatCurrency(plan.price)}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{formatCurrency(rev)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                          <div className="progress-fill" style={{ width: `${totalRev > 0 ? (rev / totalRev) * 100 : 0}%`, background: COLORS[Object.keys(PLANS).indexOf(key)] }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {totalRev > 0 ? ((rev / totalRev) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
