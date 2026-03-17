import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { STATUS_CONFIG, PLANS, PAYMENT_METHODS, formatCurrency, formatDate, downloadInvoice } from '../utils/helpers';

const EMPTY_FORM = {
  customerId: '',
  customerName: '',
  plan: 'basic',
  amount: 99000,
  method: 'transfer_bank',
  status: 'pending',
  description: 'Langganan Bulanan',
  dueDate: '',
};

// Payment Gateway Modal
function PaymentGatewayModal({ isOpen, onClose, form, onConfirm, loading }) {
  const [step, setStep] = useState(1); // 1: method, 2: detail, 3: confirm, 4: success
  const [selectedMethod, setSelectedMethod] = useState(form.method || 'transfer_bank');
  const [payDetail, setPayDetail] = useState({});

  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const plan = PLANS[form.plan];

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else {
      setStep(4);
      onConfirm({ ...form, method: selectedMethod, status: 'success' });
    }
  };

  const handleClose = () => {
    setStep(1);
    setPayDetail({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {/* Steps indicator */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              {step === 4 ? '✅ Pembayaran Berhasil' : 'Gateway Pembayaran'}
            </h3>
            {step !== 4 && (
              <button onClick={handleClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          {step < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '16px' }}>
              {['Pilih Metode', 'Detail', 'Konfirmasi'].map((label, i) => (
                <React.Fragment key={label}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: step > i + 1 ? '#10b981' : step === i + 1 ? '#1e40af' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: step >= i + 1 ? 'white' : '#94a3b8',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: step === i + 1 ? '#1e40af' : '#94a3b8', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: '2px', background: step > i + 1 ? '#10b981' : '#e2e8f0', marginBottom: '14px' }} />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          {/* Step 1: Select Method */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
                Pilih metode pembayaran untuk tagihan <strong>{formatCurrency(form.amount)}</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`payment-card ${selectedMethod === m.id ? 'selected' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{m.banks.join(' · ')}</div>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: selectedMethod === m.id ? '2px solid #1e40af' : '2px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedMethod === m.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1e40af' }} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment Detail */}
          {step === 2 && (
            <div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Detail Tagihan</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{form.description}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e40af', marginTop: '8px' }}>{formatCurrency(form.amount)}</div>
              </div>

              {selectedMethod === 'transfer_bank' && (
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Pilih Bank Tujuan:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['BCA', 'BNI', 'Mandiri', 'BRI'].map(bank => (
                      <button
                        key={bank}
                        onClick={() => setPayDetail(d => ({ ...d, bank }))}
                        style={{
                          padding: '12px', borderRadius: '10px', cursor: 'pointer',
                          border: payDetail.bank === bank ? '2px solid #1e40af' : '1px solid #e2e8f0',
                          background: payDetail.bank === bank ? '#dbeafe' : 'white',
                          fontWeight: 600, color: payDetail.bank === bank ? '#1d4ed8' : '#475569',
                        }}
                      >{bank}</button>
                    ))}
                  </div>
                  {payDetail.bank && (
                    <div style={{ marginTop: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#0369a1' }}>No. Rekening {payDetail.bank}:</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', letterSpacing: '2px', marginTop: 4 }}>
                        {payDetail.bank === 'BCA' ? '1234567890' : payDetail.bank === 'BNI' ? '0987654321' : payDetail.bank === 'Mandiri' ? '1470012345678' : '123401234567890'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>a.n. PT Jaga Rumah Indonesia</div>
                    </div>
                  )}
                </div>
              )}

              {selectedMethod === 'virtual_account' && (
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Nomor Virtual Account:</p>
                  <div style={{ background: '#f0f9ff', border: '2px dashed #3b82f6', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#0369a1', marginBottom: '8px' }}>BCA Virtual Account</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '4px' }}>8277 0001 2345 678</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>Berlaku hingga: {new Date(Date.now() + 3600000).toLocaleTimeString('id-ID')}</div>
                  </div>
                </div>
              )}

              {selectedMethod === 'e_wallet' && (
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Pilih E-Wallet:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['GoPay', 'OVO', 'DANA', 'ShopeePay'].map(w => (
                      <button key={w} onClick={() => setPayDetail(d => ({ ...d, wallet: w }))} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: payDetail.wallet === w ? '2px solid #1e40af' : '1px solid #e2e8f0', background: payDetail.wallet === w ? '#dbeafe' : 'white', fontWeight: 600, color: payDetail.wallet === w ? '#1d4ed8' : '#475569' }}>{w}</button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'qris' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'inline-block' }}>
                    <div style={{ width: '160px', height: '160px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem' }}>📲</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>QR Code</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Scan dengan aplikasi</div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px' }}>Scan menggunakan GoPay, OVO, DANA, atau aplikasi bank apapun</p>
                </div>
              )}

              {selectedMethod === 'credit_card' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Nomor Kartu</label>
                    <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19} onChange={e => { const v = e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim(); e.target.value = v; }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">MM/YY</label>
                      <input className="form-input" placeholder="12/27" maxLength={5} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input className="form-input" placeholder="123" maxLength={3} type="password" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nama</label>
                      <input className="form-input" placeholder="John Doe" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div>
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '16px' }}>RINGKASAN PEMBAYARAN</h4>
                {[
                  ['Pelanggan', form.customerName],
                  ['Paket', PLANS[form.plan]?.name],
                  ['Deskripsi', form.description],
                  ['Metode', PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{k}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', marginTop: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Total Pembayaran</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>{formatCurrency(form.amount)}</span>
                </div>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', fontSize: '0.8rem', color: '#92400e' }}>
                ⚠️ Pastikan semua data sudah benar sebelum melanjutkan. Klik "Proses Pembayaran" untuk mengkonfirmasi.
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem' }}>
                ✅
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Pembayaran Berhasil!</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
                Transaksi senilai <strong>{formatCurrency(form.amount)}</strong> telah berhasil diproses.
              </p>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID Transaksi</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>TRX-{Date.now().toString().slice(-8)}</div>
              </div>
              <button className="btn btn-primary" onClick={handleClose} style={{ width: '100%', justifyContent: 'center' }}>
                Selesai
              </button>
            </div>
          )}
        </div>

        {step < 4 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {step > 1 && (
              <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>Kembali</button>
            )}
            <button className="btn btn-outline" onClick={handleClose}>Batal</button>
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? <><div className="spinner" />Memproses...</> :
                step === 3 ? '💳 Proses Pembayaran' : 'Lanjutkan →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Payments() {
  const { payments, customers, addPayment, updatePayment, deletePayment } = useData();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    let r = [...payments];
    if (search) r = r.filter(p =>
      p.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNo?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus !== 'all') r = r.filter(p => p.status === filterStatus);
    if (filterMethod !== 'all') r = r.filter(p => p.method === filterMethod);
    return r.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, search, filterStatus, filterMethod]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((a, b) => a + b.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0);
  const successCount = payments.filter(p => p.status === 'success').length;
  const failedCount = payments.filter(p => p.status === 'failed' || p.status === 'expired').length;

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setModalOpen(true);
  };

  const openGateway = (payment) => {
    setForm({ ...payment });
    setGatewayOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerId || !form.amount) { toast.error('Pelanggan dan jumlah wajib diisi'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    if (editTarget) {
      updatePayment(editTarget.id, form);
      toast.success('Data pembayaran diperbarui');
    } else {
      addPayment(form);
      toast.success('Tagihan berhasil dibuat');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleGatewayConfirm = async (paymentData) => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 1500));
    addPayment(paymentData);
    toast.success('Pembayaran berhasil diproses!');
    setPaying(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 500));
    deletePayment(deleteTarget.id);
    toast.success('Transaksi berhasil dihapus');
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleCustomerChange = (customerId) => {
    const cust = customers.find(c => c.id === Number(customerId));
    if (cust) {
      const plan = PLANS[cust.plan];
      setForm(f => ({
        ...f,
        customerId: cust.id,
        customerName: cust.name,
        plan: cust.plan,
        amount: plan?.price || 99000,
        description: `Langganan Bulanan - ${plan?.name} Plan`,
      }));
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pembayaran</h1>
          <p className="page-subtitle">Kelola transaksi dan gateway pembayaran</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-success" onClick={() => setGatewayOpen(true)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Bayar Sekarang
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Buat Tagihan
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), color: '#10b981', icon: '💰' },
          { label: 'Menunggu Pembayaran', value: formatCurrency(totalPending), color: '#f59e0b', icon: '⏳' },
          { label: 'Transaksi Berhasil', value: successCount, color: '#3b82f6', icon: '✅' },
          { label: 'Transaksi Gagal', value: failedCount, color: '#ef4444', icon: '❌' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="form-input search-input" placeholder="Cari nama pelanggan atau nomor invoice..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">Semua Status</option>
          <option value="success">Berhasil</option>
          <option value="pending">Menunggu</option>
          <option value="failed">Gagal</option>
          <option value="expired">Kadaluarsa</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }}>
          <option value="all">Semua Metode</option>
          {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Pelanggan</th>
                <th>Deskripsi</th>
                <th>Metode</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><p>Tidak ada transaksi ditemukan</p></div></td></tr>
              ) : paginated.map(p => {
                const sc = STATUS_CONFIG.payment[p.status];
                const method = PAYMENT_METHODS.find(m => m.id === p.method);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#1e40af' }}>{p.invoiceNo}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{p.customerName}</div>
                      <span className={`badge ${PLANS[p.plan]?.color || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>{PLANS[p.plan]?.name}</span>
                    </td>
                    <td><span style={{ fontSize: '0.82rem', color: '#475569' }}>{p.description}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>{method?.icon}</span>
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>{method?.name}</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.9rem', fontWeight: 700, color: p.status === 'success' ? '#16a34a' : '#1e293b' }}>{formatCurrency(p.amount)}</span></td>
                    <td><span className={`badge ${sc?.className}`}>{sc?.label}</span></td>
                    <td><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.date}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        {p.status === 'pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => openGateway(p)} title="Bayar">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Bayar
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => downloadInvoice(p)} title="Download Invoice">
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(p)}>
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
              {[...Array(Math.min(5, totalPages))].map((_, i) => (
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

      {/* Create Invoice Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Tagihan' : 'Buat Tagihan Baru'} maxWidth="500px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" />Menyimpan...</> : 'Buat Tagihan'}
            </button>
          </>
        }
      >
        <div>
          <div className="form-group">
            <label className="form-label">Pelanggan *</label>
            <select className="form-select" value={form.customerId} onChange={e => handleCustomerChange(e.target.value)}>
              <option value="">-- Pilih Pelanggan --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({PLANS[c.plan]?.name})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Jumlah (Rp)</label>
              <input type="number" className="form-input" value={form.amount} onChange={e => update('amount', Number(e.target.value))} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <select className="form-select" value={form.method} onChange={e => update('method', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <input className="form-input" value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="pending">Menunggu</option>
                <option value="success">Berhasil</option>
                <option value="failed">Gagal</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Jatuh Tempo</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e => update('dueDate', e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Gateway */}
      <PaymentGatewayModal
        isOpen={gatewayOpen}
        onClose={() => setGatewayOpen(false)}
        form={form}
        onConfirm={handleGatewayConfirm}
        loading={paying}
      />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Transaksi" message={`Hapus transaksi "${deleteTarget?.invoiceNo}"?`} loading={deleting} />
    </div>
  );
}

export default Payments;
