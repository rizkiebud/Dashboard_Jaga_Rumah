// Format currency IDR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
};

// Format date short
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

// Format datetime
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

// Plan config
export const PLANS = {
  basic: {
    name: 'Basic',
    price: 99000,
    color: 'badge-info',
    bg: '#dbeafe',
    text: '#1d4ed8',
    cameraLimit: 4,
    storageGB: 100,
    features: ['4 kamera maksimal', '100 GB penyimpanan', 'Rekaman 7 hari', 'Notifikasi email', 'Support 24/7'],
  },
  premium: {
    name: 'Premium',
    price: 299000,
    color: 'badge-purple',
    bg: '#f3e8ff',
    text: '#7c3aed',
    cameraLimit: 10,
    storageGB: 500,
    features: ['10 kamera maksimal', '500 GB penyimpanan', 'Rekaman 30 hari', 'Notifikasi real-time', 'AI deteksi wajah', 'Support prioritas'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 899000,
    color: 'badge-warning',
    bg: '#fef3c7',
    text: '#d97706',
    cameraLimit: 50,
    storageGB: 5000,
    features: ['50 kamera maksimal', '5 TB penyimpanan', 'Rekaman 90 hari', 'Alert real-time', 'AI analitik lanjutan', 'Dedicated support', 'SLA 99.9%'],
  },
};

export const PAYMENT_METHODS = [
  { id: 'transfer_bank', name: 'Transfer Bank', icon: '🏦', banks: ['BCA', 'BNI', 'Mandiri', 'BRI'] },
  { id: 'virtual_account', name: 'Virtual Account', icon: '💳', banks: ['BCA VA', 'BNI VA', 'Mandiri VA'] },
  { id: 'e_wallet', name: 'E-Wallet', icon: '📱', banks: ['GoPay', 'OVO', 'DANA', 'ShopeePay'] },
  { id: 'qris', name: 'QRIS', icon: '📲', banks: ['Semua Bank & E-Wallet'] },
  { id: 'credit_card', name: 'Kartu Kredit', icon: '💳', banks: ['Visa', 'Mastercard', 'JCB'] },
];

export const STATUS_CONFIG = {
  camera: {
    online: { label: 'Online', className: 'badge-success' },
    offline: { label: 'Offline', className: 'badge-danger' },
    maintenance: { label: 'Maintenance', className: 'badge-warning' },
  },
  customer: {
    active: { label: 'Aktif', className: 'badge-success' },
    inactive: { label: 'Tidak Aktif', className: 'badge-gray' },
    suspended: { label: 'Ditangguhkan', className: 'badge-danger' },
  },
  payment: {
    success: { label: 'Berhasil', className: 'badge-success' },
    pending: { label: 'Menunggu', className: 'badge-warning' },
    failed: { label: 'Gagal', className: 'badge-danger' },
    expired: { label: 'Kadaluarsa', className: 'badge-gray' },
    refunded: { label: 'Dikembalikan', className: 'badge-info' },
  },
  subscription: {
    active: { label: 'Aktif', className: 'badge-success' },
    expired: { label: 'Kadaluarsa', className: 'badge-gray' },
    suspended: { label: 'Ditangguhkan', className: 'badge-danger' },
    trial: { label: 'Percobaan', className: 'badge-blue' },
  },
};

export const CAMERA_TYPES = ['IP Camera', 'PTZ Camera', 'Dome Camera', 'Bullet Camera', 'Box Camera', 'Fisheye Camera'];
export const CAMERA_RESOLUTIONS = ['720p', '1080p', '2MP', '4MP', '5MP', '4K', '8MP'];
export const CAMERA_BRANDS = ['Hikvision', 'Dahua', 'Axis', 'Bosch', 'Sony', 'Samsung', 'Xiaomi', 'TP-Link', 'Reolink', 'Lainnya'];

// Get revenue chart data (last 6 months)
export const getRevenueChartData = (payments) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    const total = payments
      .filter(p => p.status === 'success' && p.date.startsWith(key))
      .reduce((a, b) => a + b.amount, 0);
    months.push({ name: label, revenue: total, month: key });
  }
  return months;
};

// Get camera status chart data
export const getCameraStatusData = (cameras) => [
  { name: 'Online', value: cameras.filter(c => c.status === 'online').length, fill: '#10b981' },
  { name: 'Offline', value: cameras.filter(c => c.status === 'offline').length, fill: '#ef4444' },
  { name: 'Maintenance', value: cameras.filter(c => c.status === 'maintenance').length, fill: '#f59e0b' },
];

// Generate invoice PDF (mock - just print)
export const downloadInvoice = (payment) => {
  const win = window.open('', '_blank');
  win.document.write(`
    <html>
      <head>
        <title>Invoice ${payment.invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
          .invoice-no { font-size: 14px; color: #666; }
          h2 { color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f1f5f9; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏠 Jaga Rumah</div>
          <div class="invoice-no">
            <strong>${payment.invoiceNo}</strong><br/>
            Tanggal: ${payment.date}
          </div>
        </div>
        <h2>INVOICE</h2>
        <table>
          <tr><th>Pelanggan</th><td>${payment.customerName}</td></tr>
          <tr><th>Deskripsi</th><td>${payment.description}</td></tr>
          <tr><th>Metode</th><td>${payment.method?.replace('_', ' ').toUpperCase()}</td></tr>
          <tr><th>Status</th><td>${payment.status?.toUpperCase()}</td></tr>
        </table>
        <div class="total">Total: Rp ${payment.amount?.toLocaleString('id-ID')}</div>
        <div class="footer">Terima kasih telah menggunakan layanan Jaga Rumah. © 2025 Jaga Rumah</div>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};
