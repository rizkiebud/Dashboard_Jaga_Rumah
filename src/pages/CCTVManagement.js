import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { STATUS_CONFIG, CAMERA_TYPES, CAMERA_RESOLUTIONS, CAMERA_BRANDS, PLANS, formatDate } from '../utils/helpers';

const EMPTY_FORM = {
  name: '', location: '', type: 'IP Camera', resolution: '1080p',
  status: 'online', userId: '', ip: '', brand: 'Hikvision',
  model: '', lastMaintenance: '', subscription: 'basic', notes: '',
};

function CameraForm({ form, setForm, customers }) {
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Nama Kamera *</label>
          <input className="form-input" placeholder="Kamera Depan Rumah" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Lokasi *</label>
          <input className="form-input" placeholder="Jl. Merdeka No.1" value={form.location} onChange={e => update('location', e.target.value)} required />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Jenis Kamera</label>
          <select className="form-select" value={form.type} onChange={e => update('type', e.target.value)}>
            {CAMERA_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Resolusi</label>
          <select className="form-select" value={form.resolution} onChange={e => update('resolution', e.target.value)}>
            {CAMERA_RESOLUTIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Brand</label>
          <select className="form-select" value={form.brand} onChange={e => update('brand', e.target.value)}>
            {CAMERA_BRANDS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Model</label>
          <input className="form-input" placeholder="DS-2CD2143G2-I" value={form.model} onChange={e => update('model', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Alamat IP</label>
          <input className="form-input" placeholder="192.168.1.10" value={form.ip} onChange={e => update('ip', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => update('status', e.target.value)}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Pengguna</label>
          <select className="form-select" value={form.userId} onChange={e => update('userId', Number(e.target.value))}>
            <option value="">-- Pilih Pengguna --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Paket Langganan</label>
          <select className="form-select" value={form.subscription} onChange={e => update('subscription', e.target.value)}>
            {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Maintenance Terakhir</label>
        <input type="date" className="form-input" value={form.lastMaintenance} onChange={e => update('lastMaintenance', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Catatan</label>
        <textarea className="form-input" rows={3} placeholder="Keterangan tambahan..." value={form.notes} onChange={e => update('notes', e.target.value)} style={{ resize: 'vertical' }} />
      </div>
    </div>
  );
}

function CCTVManagement() {
  const { cameras, customers, addCamera, updateCamera, deleteCamera } = useData();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table | grid

  const filtered = useMemo(() => {
    let result = [...cameras];
    if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()) || c.ip?.includes(search));
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
    if (filterType !== 'all') result = result.filter(c => c.type === filterType);
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'location') return a.location.localeCompare(b.location);
      return 0;
    });
    return result;
  }, [cameras, search, filterStatus, filterType, sortBy]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (cam) => { setForm({ ...cam }); setEditTarget(cam); setModalOpen(true); };
  const openDetail = (cam) => setDetailTarget(cam);
  const openDelete = (cam) => setDeleteTarget(cam);

  const handleSave = async () => {
    if (!form.name || !form.location) { toast.error('Nama dan Lokasi wajib diisi'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    if (editTarget) {
      updateCamera(editTarget.id, form);
      toast.success('Kamera berhasil diperbarui');
    } else {
      addCamera(form);
      toast.success('Kamera berhasil ditambahkan');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 500));
    deleteCamera(deleteTarget.id);
    toast.success('Kamera berhasil dihapus');
    setDeleting(false);
    setDeleteTarget(null);
  };

  const getCustomerName = (userId) => customers.find(c => c.id === userId)?.name || '-';

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.filter(c => c.status === 'offline').length;
  const maintenanceCount = cameras.filter(c => c.status === 'maintenance').length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen CCTV</h1>
          <p className="page-subtitle">Kelola semua perangkat kamera CCTV Anda</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kamera
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Kamera', value: cameras.length, color: '#3b82f6', bg: '#dbeafe', status: 'all' },
          { label: 'Online', value: onlineCount, color: '#10b981', bg: '#dcfce7', status: 'online' },
          { label: 'Offline', value: offlineCount, color: '#ef4444', bg: '#fee2e2', status: 'offline' },
          { label: 'Maintenance', value: maintenanceCount, color: '#f59e0b', bg: '#fef3c7', status: 'maintenance' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => { setFilterStatus(s.status); setPage(1); }}
            style={{
              background: filterStatus === s.status ? s.bg : 'white',
              border: filterStatus === s.status ? `2px solid ${s.color}` : '2px solid #e2e8f0',
              borderRadius: '12px', padding: '16px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '16px 20px',
        marginBottom: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
        display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="form-input search-input"
            placeholder="Cari nama, lokasi, atau IP..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
          <option value="all">Semua Jenis</option>
          {CAMERA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Nama A-Z</option>
          <option value="status">Status</option>
          <option value="location">Lokasi</option>
        </select>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {['table', 'grid'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '7px 10px', border: '1px solid #e2e8f0',
                borderRadius: '8px', cursor: 'pointer',
                background: viewMode === mode ? '#1e40af' : 'white',
                color: viewMode === mode ? 'white' : '#64748b',
              }}
            >
              {mode === 'table' ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg>
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
        overflow: 'hidden',
      }}>
        {viewMode === 'table' ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kamera</th>
                    <th>Lokasi / IP</th>
                    <th>Jenis</th>
                    <th>Resolusi</th>
                    <th>Pengguna</th>
                    <th>Status</th>
                    <th>Maintenance</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p>Tidak ada kamera ditemukan</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map(cam => {
                    const sc = STATUS_CONFIG.camera[cam.status];
                    const plan = PLANS[cam.subscription];
                    return (
                      <tr key={cam.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: cam.status === 'online' ? '#dbeafe' : cam.status === 'offline' ? '#fee2e2' : '#fef3c7',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={cam.status === 'online' ? '#1d4ed8' : cam.status === 'offline' ? '#dc2626' : '#d97706'} strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{cam.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cam.brand} {cam.model}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{cam.location}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{cam.ip || '-'}</div>
                        </td>
                        <td><span style={{ fontSize: '0.8rem', color: '#475569' }}>{cam.type}</span></td>
                        <td><span className="badge badge-blue">{cam.resolution}</span></td>
                        <td><span style={{ fontSize: '0.8rem', color: '#475569' }}>{getCustomerName(cam.userId)}</span></td>
                        <td><span className={`badge ${sc?.className}`}>{sc?.label}</span></td>
                        <td><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(cam.lastMaintenance)}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline btn-sm btn-icon" onClick={() => openDetail(cam)} title="Detail">
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(cam)} title="Edit">
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(cam)} title="Hapus">
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
          </>
        ) : (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {paginated.map(cam => {
              const sc = STATUS_CONFIG.camera[cam.status];
              return (
                <div key={cam.id} className="card-hover" style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{
                    aspectRatio: '16/9',
                    background: `linear-gradient(135deg, #0f172a, ${cam.status === 'online' ? '#1e3a8a' : '#1c1c1c'})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={cam.status === 'online' ? '#3b82f6' : '#374151'} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {cam.status === 'online' && (
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 6px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'blink 2s infinite' }} />
                        <span style={{ color: '#10b981', fontSize: '0.6rem', fontWeight: 600 }}>LIVE</span>
                      </div>
                    )}
                    <span className={`badge ${sc?.className}`} style={{ position: 'absolute', bottom: 8, left: 8, fontSize: '0.65rem' }}>{sc?.label}</span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', marginBottom: 2 }}>{cam.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>{cam.location}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(cam)}>Edit</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(cam)}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: page === i + 1 ? '1px solid #1e40af' : '1px solid #e2e8f0',
                    background: page === i + 1 ? '#1e40af' : 'white',
                    color: page === i + 1 ? 'white' : '#475569',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
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
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Kamera' : 'Tambah Kamera Baru'}
        maxWidth="640px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" />Menyimpan...</> : <>{editTarget ? 'Simpan Perubahan' : 'Tambah Kamera'}</>}
            </button>
          </>
        }
      >
        <CameraForm form={form} setForm={setForm} customers={customers} />
      </Modal>

      {/* Detail Modal */}
      {detailTarget && (
        <Modal isOpen={!!detailTarget} onClose={() => setDetailTarget(null)} title="Detail Kamera" maxWidth="500px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: '#0f172a', borderRadius: '12px', aspectRatio: '16/9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke={detailTarget.status === 'online' ? '#3b82f6' : '#374151'} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {detailTarget.status === 'online' && (
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4, alignItems: 'center', background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 8px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'blink 2s infinite' }} />
                  <span style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>LIVE</span>
                </div>
              )}
            </div>
            {[
              ['Nama', detailTarget.name],
              ['Lokasi', detailTarget.location],
              ['Jenis', detailTarget.type],
              ['Brand / Model', `${detailTarget.brand} ${detailTarget.model}`],
              ['Resolusi', detailTarget.resolution],
              ['Alamat IP', detailTarget.ip || '-'],
              ['Status', detailTarget.status],
              ['Paket', PLANS[detailTarget.subscription]?.name || '-'],
              ['Pengguna', getCustomerName(detailTarget.userId)],
              ['Dipasang', formatDate(detailTarget.installedAt)],
              ['Maintenance', formatDate(detailTarget.lastMaintenance)],
              ['Catatan', detailTarget.notes || '-'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Kamera"
        message={`Apakah Anda yakin ingin menghapus kamera "${deleteTarget?.name}"? Semua data terkait akan ikut terhapus.`}
        loading={deleting}
      />
    </div>
  );
}

export default CCTVManagement;
