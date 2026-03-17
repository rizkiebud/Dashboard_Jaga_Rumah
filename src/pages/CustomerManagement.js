import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { STATUS_CONFIG, PLANS, formatCurrency, formatDate } from '../utils/helpers';

const EMPTY_FORM = {
  name: '', email: '', phone: '', address: '',
  plan: 'basic', status: 'active', avatar: '',
};

function CustomerForm({ form, setForm }) {
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const initials = form.name ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div>
      {/* Avatar preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
        }}>
          {initials}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Nama Lengkap *</label>
          <input className="form-input" placeholder="Budi Santoso / CV Maju Bersama" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">No. Telepon</label>
          <input className="form-input" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Alamat</label>
          <textarea className="form-input" rows={2} placeholder="Jl. Merdeka No.1, Jakarta" value={form.address} onChange={e => update('address', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Paket Langganan</label>
          <select className="form-select" value={form.plan} onChange={e => update('plan', e.target.value)}>
            {Object.entries(PLANS).map(([k, v]) => (
              <option key={k} value={k}>{v.name} - {formatCurrency(v.price)}/bln</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => update('status', e.target.value)}>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Plan info */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginTop: '4px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Fitur Paket {PLANS[form.plan]?.name}:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PLANS[form.plan]?.features.map(f => (
            <span key={f} style={{ fontSize: '0.72rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 8px', color: '#475569' }}>
              ✓ {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomerManagement() {
  const { customers, cameras, addCustomer, updateCustomer, deleteCustomer } = useData();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let r = [...customers];
    if (search) r = r.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    );
    if (filterPlan !== 'all') r = r.filter(c => c.plan === filterPlan);
    if (filterStatus !== 'all') r = r.filter(c => c.status === filterStatus);
    return r;
  }, [customers, search, filterPlan, filterStatus]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditTarget(null); setModalOpen(true); };
  const openEdit = (c) => { setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, plan: c.plan, status: c.status }); setEditTarget(c); setModalOpen(true); };
  const openDetail = (c) => setDetailTarget(c);

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Nama dan email wajib diisi'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const initials = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    if (editTarget) {
      updateCustomer(editTarget.id, { ...form, avatar: initials });
      toast.success('Data pengguna berhasil diperbarui');
    } else {
      addCustomer({ ...form, avatar: initials, lastPayment: '-' });
      toast.success('Pengguna baru berhasil ditambahkan');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 500));
    deleteCustomer(deleteTarget.id);
    toast.success('Pengguna berhasil dihapus');
    setDeleting(false);
    setDeleteTarget(null);
  };

  const getCameraCount = (id) => cameras.filter(c => c.userId === id).length;

  const activeCount = customers.filter(c => c.status === 'active').length;
  const suspendedCount = customers.filter(c => c.status === 'suspended').length;
  const inactiveCount = customers.filter(c => c.status === 'inactive').length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-subtitle">Kelola data pelanggan layanan CCTV</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Pengguna', value: customers.length, color: '#3b82f6', status: 'all' },
          { label: 'Aktif', value: activeCount, color: '#10b981', status: 'active' },
          { label: 'Ditangguhkan', value: suspendedCount, color: '#ef4444', status: 'suspended' },
          { label: 'Tidak Aktif', value: inactiveCount, color: '#94a3b8', status: 'inactive' },
        ].map(s => (
          <button key={s.label} onClick={() => { setFilterStatus(s.status); setPage(1); }} style={{
            background: filterStatus === s.status ? `${s.color}12` : 'white',
            border: filterStatus === s.status ? `2px solid ${s.color}` : '2px solid #e2e8f0',
            borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '16px 20px',
        marginBottom: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
        display: 'flex', gap: '12px', flexWrap: 'wrap',
      }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="form-input search-input" placeholder="Cari nama, email, telepon..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}>
          <option value="all">Semua Paket</option>
          {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Kontak</th>
                <th>Paket</th>
                <th>Kamera</th>
                <th>Status</th>
                <th>Bergabung</th>
                <th>Total Bayar</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <p>Tidak ada pengguna ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(c => {
                const sc = STATUS_CONFIG.customer[c.status];
                const plan = PLANS[c.plan];
                const camCount = getCameraCount(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                        }}>{c.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>{c.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.phone}</div>
                    </td>
                    <td>
                      <span className={`badge ${plan?.color || 'badge-gray'}`}>{plan?.name}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{camCount}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {plan?.cameraLimit}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${sc?.className}`}>{sc?.label}</span></td>
                    <td><span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{formatDate(c.joinDate)}</span></td>
                    <td><span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(c.totalSpent)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openDetail(c)} title="Detail">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(c)} title="Edit">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(c)} title="Hapus">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length}
            </span>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Pengguna' : 'Tambah Pengguna Baru'} maxWidth="560px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" />Menyimpan...</> : editTarget ? 'Simpan Perubahan' : 'Tambah Pengguna'}
            </button>
          </>
        }
      >
        <CustomerForm form={form} setForm={setForm} />
      </Modal>

      {/* Detail Modal */}
      {detailTarget && (
        <Modal isOpen={!!detailTarget} onClose={() => setDetailTarget(null)} title="Detail Pengguna" maxWidth="460px">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                {detailTarget.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{detailTarget.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{detailTarget.email}</div>
                <span className={`badge ${STATUS_CONFIG.customer[detailTarget.status]?.className}`} style={{ marginTop: 4 }}>
                  {STATUS_CONFIG.customer[detailTarget.status]?.label}
                </span>
              </div>
            </div>
            {[
              ['Telepon', detailTarget.phone],
              ['Alamat', detailTarget.address],
              ['Paket', PLANS[detailTarget.plan]?.name],
              ['Jumlah Kamera', getCameraCount(detailTarget.id)],
              ['Bergabung', formatDate(detailTarget.joinDate)],
              ['Pembayaran Terakhir', formatDate(detailTarget.lastPayment)],
              ['Total Pengeluaran', formatCurrency(detailTarget.totalSpent)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{k}</span>
                <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Pengguna" message={`Hapus pengguna "${deleteTarget?.name}"? Semua kamera, langganan, dan riwayat pembayaran terkait juga akan dihapus.`} loading={deleting} />
    </div>
  );
}

export default CustomerManagement;
