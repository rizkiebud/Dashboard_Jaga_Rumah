import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { STATUS_CONFIG, PLANS, formatCurrency, formatDate } from '../utils/helpers';

const PLAN_CARDS = [
  { key: 'basic', emoji: '🏠', popular: false },
  { key: 'premium', emoji: '⭐', popular: true },
  { key: 'enterprise', emoji: '🏢', popular: false },
];

function PlanPicker({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '4px' }}>
      {PLAN_CARDS.map(pc => {
        const plan = PLANS[pc.key];
        const isSelected = selected === pc.key;
        return (
          <button
            key={pc.key}
            onClick={() => onSelect(pc.key)}
            style={{
              border: isSelected ? '2px solid #1e40af' : '2px solid #e2e8f0',
              borderRadius: '12px', padding: '16px 12px',
              background: isSelected ? '#dbeafe' : 'white',
              cursor: 'pointer', textAlign: 'center', position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            {pc.popular && (
              <div style={{ position: 'absolute', top: -1, right: 8, background: '#1e40af', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '0 0 6px 6px' }}>
                POPULER
              </div>
            )}
            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{pc.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>{plan.name}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? '#1e40af' : '#475569', marginTop: 4 }}>
              {formatCurrency(plan.price)}<span style={{ fontWeight: 400, fontSize: '0.65rem' }}>/bln</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const EMPTY_FORM = {
  customerId: '',
  customerName: '',
  plan: 'basic',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'active',
  autoRenew: true,
};

function Subscriptions() {
  const { subscriptions, customers, addSubscription, updateSubscription, deleteSubscription } = useData();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [viewTab, setViewTab] = useState('list'); // list | plans

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    let r = [...subscriptions];
    if (search) r = r.filter(s => s.customerName?.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== 'all') r = r.filter(s => s.status === filterStatus);
    if (filterPlan !== 'all') r = r.filter(s => s.plan === filterPlan);
    return r;
  }, [subscriptions, search, filterStatus, filterPlan]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  const suspendedCount = subscriptions.filter(s => s.status === 'suspended').length;
  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + (PLANS[s.plan]?.price || 0), 0);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditTarget(null); setModalOpen(true); };
  const openEdit = (s) => { setForm({ ...s }); setEditTarget(s); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.customerId || !form.plan) { toast.error('Pelanggan dan paket wajib dipilih'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const plan = PLANS[form.plan];
    const endDate = form.endDate || new Date(new Date(form.startDate).setMonth(new Date(form.startDate).getMonth() + 1)).toISOString().split('T')[0];
    if (editTarget) {
      updateSubscription(editTarget.id, { ...form, endDate, cameraLimit: plan.cameraLimit, storageGB: plan.storageGB });
      toast.success('Langganan berhasil diperbarui');
    } else {
      addSubscription({ ...form, endDate, cameraLimit: plan.cameraLimit, storageGB: plan.storageGB });
      toast.success('Langganan berhasil ditambahkan');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 500));
    deleteSubscription(deleteTarget.id);
    toast.success('Langganan berhasil dihapus');
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleCustomerChange = (id) => {
    const cust = customers.find(c => c.id === Number(id));
    if (cust) update('customerName', cust.name);
    update('customerId', Number(id));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Langganan</h1>
          <p className="page-subtitle">Kelola paket langganan CCTV pengguna</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Tambah Langganan
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Langganan', value: subscriptions.length, color: '#3b82f6', icon: '📋' },
          { label: 'Aktif', value: activeCount, color: '#10b981', icon: '✅' },
          { label: 'Kadaluarsa', value: expiredCount, color: '#94a3b8', icon: '⏰' },
          { label: 'MRR (Est.)', value: formatCurrency(totalMonthly), color: '#8b5cf6', icon: '💵' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'white', borderRadius: '12px', padding: '4px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', width: 'fit-content', marginBottom: '16px' }}>
        {[['list', 'Daftar Langganan'], ['plans', 'Paket Layanan']].map(([key, label]) => (
          <button key={key} onClick={() => setViewTab(key)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: viewTab === key ? '#1e40af' : 'none', color: viewTab === key ? 'white' : '#64748b', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {viewTab === 'plans' ? (
        /* Plans View */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {PLAN_CARDS.map(pc => {
              const plan = PLANS[pc.key];
              const activeSubs = subscriptions.filter(s => s.plan === pc.key && s.status === 'active').length;
              return (
                <div key={pc.key} className={`plan-card ${pc.popular ? 'popular' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '2rem' }}>{pc.emoji}</div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{plan.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{activeSubs} pengguna aktif</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(plan.price)}</span>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>/bulan</span>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Kamera Maksimal</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{plan.cameraLimit}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Penyimpanan</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{plan.storageGB >= 1000 ? `${plan.storageGB / 1000} TB` : `${plan.storageGB} GB`}</span>
                    </div>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`btn ${pc.popular ? 'btn-primary' : 'btn-outline'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => { setForm({ ...EMPTY_FORM, plan: pc.key }); setEditTarget(null); setModalOpen(true); }}
                  >
                    Tambah Pelanggan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input className="form-input search-input" placeholder="Cari nama pengguna..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="expired">Kadaluarsa</option>
              <option value="suspended">Ditangguhkan</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}>
              <option value="all">Semua Paket</option>
              {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Paket</th>
                    <th>Kamera Limit</th>
                    <th>Storage</th>
                    <th>Mulai</th>
                    <th>Berakhir</th>
                    <th>Auto Renewal</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={9}><div className="empty-state"><p>Tidak ada langganan ditemukan</p></div></td></tr>
                  ) : paginated.map(s => {
                    const sc = STATUS_CONFIG.subscription[s.status];
                    const plan = PLANS[s.plan];
                    const daysLeft = s.endDate ? Math.ceil((new Date(s.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{s.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID #{s.customerId}</div>
                        </td>
                        <td>
                          <span className={`badge ${plan?.color || 'badge-gray'}`}>{plan?.name}</span>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 3 }}>{formatCurrency(plan?.price || 0)}/bln</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>{s.cameraLimit}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '0.82rem', color: '#475569' }}>{s.storageGB >= 1000 ? `${s.storageGB / 1000} TB` : `${s.storageGB} GB`}</span></td>
                        <td><span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{formatDate(s.startDate)}</span></td>
                        <td>
                          <div>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{formatDate(s.endDate)}</div>
                            {daysLeft !== null && s.status === 'active' && (
                              <div style={{ fontSize: '0.72rem', color: daysLeft < 7 ? '#ef4444' : daysLeft < 30 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                                {daysLeft < 0 ? 'Kadaluarsa' : `${daysLeft} hari lagi`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.75rem', fontWeight: 600,
                            color: s.autoRenew ? '#16a34a' : '#94a3b8',
                          }}>
                            {s.autoRenew ? '✓ Aktif' : '✗ Nonaktif'}
                          </span>
                        </td>
                        <td><span className={`badge ${sc?.className}`}>{sc?.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)}>
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(s)}>
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: page === i + 1 ? '1px solid #1e40af' : '1px solid #e2e8f0', background: page === i + 1 ? '#1e40af' : 'white', color: page === i + 1 ? 'white' : '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      {i + 1}
                    </button>
                  ))}
                  <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Langganan' : 'Tambah Langganan Baru'} maxWidth="560px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" />Menyimpan...</> : editTarget ? 'Simpan Perubahan' : 'Tambah Langganan'}
            </button>
          </>
        }
      >
        <div>
          <div className="form-group">
            <label className="form-label">Pelanggan *</label>
            <select className="form-select" value={form.customerId} onChange={e => handleCustomerChange(e.target.value)}>
              <option value="">-- Pilih Pelanggan --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Paket *</label>
            <PlanPicker selected={form.plan} onSelect={p => update('plan', p)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Tanggal Mulai</label>
              <input type="date" className="form-input" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Berakhir</label>
              <input type="date" className="form-input" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="active">Aktif</option>
                <option value="expired">Kadaluarsa</option>
                <option value="suspended">Ditangguhkan</option>
                <option value="trial">Percobaan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Auto Renewal</label>
              <select className="form-select" value={form.autoRenew ? 'true' : 'false'} onChange={e => update('autoRenew', e.target.value === 'true')}>
                <option value="true">Aktifkan</option>
                <option value="false">Nonaktifkan</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Langganan" message={`Hapus langganan "${deleteTarget?.customerName}"?`} loading={deleting} />
    </div>
  );
}

export default Subscriptions;
