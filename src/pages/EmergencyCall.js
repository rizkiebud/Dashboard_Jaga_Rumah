import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDateTime } from '../utils/helpers';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'police',   label: 'Kepolisian',  icon: '🚔', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'fire',     label: 'Pemadam',     icon: '🚒', color: '#ef4444', bg: '#fee2e2' },
  { key: 'medical',  label: 'Medis',       icon: '🚑', color: '#10b981', bg: '#dcfce7' },
  { key: 'security', label: 'Keamanan',    icon: '💂', color: '#8b5cf6', bg: '#f3e8ff' },
  { key: 'disaster', label: 'Bencana',     icon: '🆘', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'other',    label: 'Lainnya',     icon: '📞', color: '#64748b', bg: '#f1f5f9' },
];

const PRIORITIES = [
  { value: 1, label: 'Prioritas 1 – Sangat Penting', color: '#ef4444' },
  { value: 2, label: 'Prioritas 2 – Penting',        color: '#f59e0b' },
  { value: 3, label: 'Prioritas 3 – Normal',         color: '#10b981' },
];

const EMPTY_FORM = {
  name: '', category: 'police', phone: '', altPhone: '',
  address: '', area: '', priority: 1, status: 'active',
  respondTime: '', notes: '',
};

function getCat(key) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

// ─── Category Badge ───────────────────────────────────────────────────────────
function CatBadge({ category }) {
  const cat = getCat(category);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cat.bg, color: cat.color,
      fontSize: '0.72rem', fontWeight: 700,
      padding: '3px 10px', borderRadius: 9999,
    }}>
      {cat.icon} {cat.label}
    </span>
  );
}

// ─── Priority Dot ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const p = PRIORITIES.find(x => x.value === priority) || PRIORITIES[2];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.72rem', fontWeight: 700, color: p.color,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
      P{priority}
    </span>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function EmergencyForm({ form, setForm }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cat = getCat(form.category);

  return (
    <div>
      {/* Category picker */}
      <div className="form-group">
        <label className="form-label">Kategori *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => set('category', c.key)}
              style={{
                padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                border: form.category === c.key ? `2px solid ${c.color}` : '2px solid #e2e8f0',
                background: form.category === c.key ? c.bg : 'white',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.78rem', fontWeight: 600,
                color: form.category === c.key ? c.color : '#475569',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Nama Kontak / Instansi *</label>
          <input className="form-input" placeholder="Polsek Menteng / IGD RS Cipto..." value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">No. Telepon Utama *</label>
          <input className="form-input" placeholder="021-xxxxxxx / 110" value={form.phone} onChange={e => set('phone', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">No. Alternatif</label>
          <input className="form-input" placeholder="08xxxxxxxxxx" value={form.altPhone} onChange={e => set('altPhone', e.target.value)} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Alamat</label>
          <input className="form-input" placeholder="Jl. Merdeka No.1, Jakarta Pusat" value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Wilayah / Area</label>
          <input className="form-input" placeholder="Jakarta Pusat" value={form.area} onChange={e => set('area', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Estimasi Respons</label>
          <input className="form-input" placeholder="5-10 menit" value={form.respondTime} onChange={e => set('respondTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Prioritas</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', Number(e.target.value))}>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Catatan</label>
          <textarea className="form-input" rows={2} placeholder="Piket 24 jam, armada 3 unit..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Dial Modal ───────────────────────────────────────────────────────────────
function DialModal({ contact, isOpen, onClose, onConfirm }) {
  if (!isOpen || !contact) return null;
  const cat = getCat(contact.category);
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 400 }}>
        {/* Animated ring */}
        <div style={{
          background: `linear-gradient(135deg, ${cat.bg}, white)`,
          borderRadius: '16px 16px 0 0',
          padding: '32px 24px', textAlign: 'center',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: cat.bg, border: `3px solid ${cat.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 14px',
            boxShadow: `0 0 0 8px ${cat.color}18, 0 0 0 16px ${cat.color}0a`,
          }}>
            {cat.icon}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{contact.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{cat.label} · {contact.area}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: cat.color, marginTop: 12, letterSpacing: 2 }}>
            {contact.phone}
          </div>
          {contact.altPhone && (
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
              Alt: {contact.altPhone}
            </div>
          )}
          {contact.respondTime && (
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8 }}>
              ⏱ Estimasi tiba: {contact.respondTime}
            </div>
          )}
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: 'center', gap: 8 }}
            onClick={() => { onConfirm(contact.id); onClose(); }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Hubungi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmergencyCall() {
  const { emergencies, addEmergency, updateEmergency, deleteEmergency, recordCall } = useData();
  const toast = useToast();

  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrio, setFilterPrio]   = useState('all');
  const [page, setPage]               = useState(1);
  const PER = 8;

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dialTarget, setDialTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // ── filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...emergencies];
    if (search)       r = r.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search) || e.area?.toLowerCase().includes(search.toLowerCase()));
    if (filterCat    !== 'all') r = r.filter(e => e.category === filterCat);
    if (filterStatus !== 'all') r = r.filter(e => e.status === filterStatus);
    if (filterPrio   !== 'all') r = r.filter(e => e.priority === Number(filterPrio));
    r.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
    return r;
  }, [emergencies, search, filterCat, filterStatus, filterPrio]);

  const pages     = Math.ceil(filtered.length / PER);
  const paginated = filtered.slice((page - 1) * PER, page * PER);

  // ── handlers ───────────────────────────────────────────────────────────────
  const openAdd  = () => { setForm({ ...EMPTY_FORM }); setEditTarget(null); setModalOpen(true); };
  const openEdit = (e) => { setForm({ name: e.name, category: e.category, phone: e.phone, altPhone: e.altPhone || '', address: e.address || '', area: e.area || '', priority: e.priority, status: e.status, respondTime: e.respondTime || '', notes: e.notes || '' }); setEditTarget(e); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.phone) { toast.error('Nama dan nomor telepon wajib diisi'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    if (editTarget) {
      updateEmergency(editTarget.id, form);
      toast.success('Kontak darurat berhasil diperbarui');
    } else {
      addEmergency(form);
      toast.success('Kontak darurat berhasil ditambahkan');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 400));
    deleteEmergency(deleteTarget.id);
    toast.success('Kontak darurat berhasil dihapus');
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleDial = (id) => {
    recordCall(id);
    const contact = emergencies.find(e => e.id === id);
    toast.success(`Panggilan ke ${contact?.name} dicatat`);
  };

  // ── summary counts ─────────────────────────────────────────────────────────
  const activeCount   = emergencies.filter(e => e.status === 'active').length;
  const totalCalls    = emergencies.reduce((a, e) => a + (e.calledCount || 0), 0);
  const prio1Count    = emergencies.filter(e => e.priority === 1).length;

  return (
    <div className="fade-in">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Emergency Call</h1>
          <p className="page-subtitle">Kelola kontak darurat untuk pengguna layanan Jaga Rumah</p>
        </div>
        <button className="btn btn-danger" onClick={openAdd}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kontak Darurat
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Kontak', value: emergencies.length, icon: '📋', color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Kontak Aktif',  value: activeCount,        icon: '✅', color: '#10b981', bg: '#dcfce7' },
          { label: 'Prioritas 1',   value: prio1Count,         icon: '🚨', color: '#ef4444', bg: '#fee2e2' },
          { label: 'Total Panggilan', value: totalCalls,       icon: '📞', color: '#8b5cf6', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 14, padding: '18px 20px',
            border: '1px solid #f0f4f8',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Quick Filter ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => { setFilterCat('all'); setPage(1); }}
          style={{ padding: '7px 16px', borderRadius: 9999, border: filterCat === 'all' ? '2px solid #1e40af' : '2px solid #e2e8f0', background: filterCat === 'all' ? '#dbeafe' : 'white', color: filterCat === 'all' ? '#1d4ed8' : '#64748b', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
        >
          Semua
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => { setFilterCat(c.key); setPage(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9999, border: filterCat === c.key ? `2px solid ${c.color}` : '2px solid #e2e8f0', background: filterCat === c.key ? c.bg : 'white', color: filterCat === c.key ? c.color : '#64748b', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div style={{ background: 'white', borderRadius: 12, padding: '14px 18px', marginBottom: 16, border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="form-input search-input" placeholder="Cari nama, telepon, atau wilayah..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterPrio} onChange={e => { setFilterPrio(e.target.value); setPage(1); }}>
          <option value="all">Semua Prioritas</option>
          <option value="1">Prioritas 1</option>
          <option value="2">Prioritas 2</option>
          <option value="3">Prioritas 3</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
          {filtered.length} kontak
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f4f8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kontak / Instansi</th>
                <th>Kategori</th>
                <th>Nomor Telepon</th>
                <th>Wilayah</th>
                <th>Prioritas</th>
                <th>Respons</th>
                <th>Panggilan</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <p>Tidak ada kontak darurat ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(e => {
                const cat = getCat(e.category);
                return (
                  <tr key={e.id}>
                    {/* Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>
                          {cat.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{e.name}</div>
                          {e.address && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.address}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td><CatBadge category={e.category} /></td>

                    {/* Phone */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', fontFamily: 'monospace' }}>{e.phone}</div>
                      {e.altPhone && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>{e.altPhone}</div>}
                    </td>

                    {/* Area */}
                    <td><span style={{ fontSize: '0.82rem', color: '#475569' }}>{e.area || '-'}</span></td>

                    {/* Priority */}
                    <td><PriorityBadge priority={e.priority} /></td>

                    {/* Respond time */}
                    <td><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{e.respondTime || '-'}</span></td>

                    {/* Called count */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: e.calledCount > 0 ? '#1e293b' : '#94a3b8' }}>{e.calledCount}</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>kali</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: '0.72rem', fontWeight: 700,
                        padding: '3px 10px', borderRadius: 9999,
                        background: e.status === 'active' ? '#dcfce7' : '#f1f5f9',
                        color: e.status === 'active' ? '#16a34a' : '#64748b',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.status === 'active' ? '#16a34a' : '#94a3b8', display: 'inline-block' }} />
                        {e.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {/* Call */}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDialTarget(e)}
                          title="Hubungi"
                          disabled={e.status !== 'active'}
                          style={{ gap: 5 }}
                        >
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          Hubungi
                        </button>
                        {/* Detail */}
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => setDetailTarget(e)} title="Detail">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {/* Edit */}
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(e)} title="Edit">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        {/* Delete */}
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(e)} title="Hapus">
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {(page - 1) * PER + 1}–{Math.min(page * PER, filtered.length)} dari {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {[...Array(pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: page === i + 1 ? '1px solid #1e40af' : '1px solid #e2e8f0', background: page === i + 1 ? '#1e40af' : 'white', color: page === i + 1 ? 'white' : '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  {i + 1}
                </button>
              ))}
              <button className="pagination-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Kontak Darurat' : 'Tambah Kontak Darurat'}
        maxWidth="620px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button>
            <button className="btn btn-danger" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" />Menyimpan...</> : editTarget ? 'Simpan Perubahan' : 'Tambah Kontak'}
            </button>
          </>
        }
      >
        <EmergencyForm form={form} setForm={setForm} />
      </Modal>

      {/* ── Detail Modal ── */}
      {detailTarget && (
        <Modal isOpen onClose={() => setDetailTarget(null)} title="Detail Kontak Darurat" maxWidth="480px">
          {(() => {
            const e = detailTarget;
            const cat = getCat(e.category);
            return (
              <div>
                {/* Header */}
                <div style={{ background: cat.bg, borderRadius: 12, padding: '20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: 'white', border: `2px solid ${cat.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{e.name}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                      <CatBadge category={e.category} />
                      <PriorityBadge priority={e.priority} />
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                {[
                  ['📞 Telepon Utama', e.phone],
                  ['📱 Telepon Alternatif', e.altPhone || '-'],
                  ['📍 Alamat', e.address || '-'],
                  ['🗺️ Wilayah', e.area || '-'],
                  ['⏱️ Estimasi Respons', e.respondTime || '-'],
                  ['📅 Ditambahkan', e.createdAt],
                  ['📲 Total Panggilan', `${e.calledCount} kali`],
                  ['🕐 Terakhir Dihubungi', e.lastCalled ? formatDateTime(e.lastCalled) : 'Belum pernah'],
                  ['📝 Catatan', e.notes || '-'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #f1f5f9', gap: 10 }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>{k}</span>
                    <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}

                <button
                  className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16, gap: 8 }}
                  onClick={() => { setDetailTarget(null); setDialTarget(e); }}
                  disabled={e.status !== 'active'}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Hubungi Sekarang
                </button>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ── Dial Modal ── */}
      <DialModal
        contact={dialTarget}
        isOpen={!!dialTarget}
        onClose={() => setDialTarget(null)}
        onConfirm={handleDial}
      />

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Kontak Darurat"
        message={`Hapus kontak "${deleteTarget?.name}"? Data riwayat panggilan juga akan dihapus.`}
        loading={deleting}
      />
    </div>
  );
}
