import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_CAMERAS = [
  { id: 1, name: 'Kamera Depan Rumah', location: 'Jl. Merdeka No.1', type: 'IP Camera', resolution: '4K', status: 'online', userId: 1, ip: '192.168.1.10', brand: 'Hikvision', model: 'DS-2CD2143G2-I', installedAt: '2024-01-10', lastMaintenance: '2024-11-01', subscription: 'premium', notes: 'Kamera utama area depan' },
  { id: 2, name: 'Kamera Garasi', location: 'Jl. Merdeka No.1', type: 'PTZ Camera', resolution: '1080p', status: 'online', userId: 1, ip: '192.168.1.11', brand: 'Dahua', model: 'SD49425XB-HNR', installedAt: '2024-01-10', lastMaintenance: '2024-11-01', subscription: 'premium', notes: 'Pantau area parkir' },
  { id: 3, name: 'Kamera Belakang', location: 'Jl. Sudirman No.5', type: 'Dome Camera', resolution: '2MP', status: 'offline', userId: 2, ip: '192.168.2.10', brand: 'Axis', model: 'P3245-V', installedAt: '2024-02-20', lastMaintenance: '2024-10-15', subscription: 'basic', notes: 'Area belakang taman' },
  { id: 4, name: 'Kamera Ruang Tamu', location: 'Jl. Sudirman No.5', type: 'IP Camera', resolution: '5MP', status: 'online', userId: 2, ip: '192.168.2.11', brand: 'Hikvision', model: 'DS-2CD2T55FWD-I5', installedAt: '2024-02-20', lastMaintenance: '2024-10-15', subscription: 'basic', notes: 'Indoor living room' },
  { id: 5, name: 'Kamera Gudang', location: 'Jl. Gatot Subroto No.12', type: 'Bullet Camera', resolution: '1080p', status: 'maintenance', userId: 3, ip: '192.168.3.10', brand: 'Bosch', model: 'FLEXIDOME 5100i', installedAt: '2024-03-05', lastMaintenance: '2024-09-20', subscription: 'enterprise', notes: 'Pengawasan gudang barang' },
  { id: 6, name: 'Kamera Lobby Kantor', location: 'Jl. Gatot Subroto No.12', type: 'PTZ Camera', resolution: '4K', status: 'online', userId: 3, ip: '192.168.3.11', brand: 'Sony', model: 'SNC-EB600B', installedAt: '2024-03-05', lastMaintenance: '2024-09-20', subscription: 'enterprise', notes: 'Lobby utama gedung' },
  { id: 7, name: 'Kamera Carport', location: 'Jl. Ahmad Yani No.3', type: 'IP Camera', resolution: '2MP', status: 'online', userId: 4, ip: '192.168.4.10', brand: 'Dahua', model: 'IPC-HDW2831T-AS', installedAt: '2024-04-12', lastMaintenance: '2024-12-01', subscription: 'basic', notes: 'Area parkir depan' },
  { id: 8, name: 'Kamera Dapur', location: 'Jl. Ahmad Yani No.3', type: 'Dome Camera', resolution: '1080p', status: 'offline', userId: 4, ip: '192.168.4.11', brand: 'Xiaomi', model: 'Mi Camera 2K', installedAt: '2024-04-12', lastMaintenance: '2024-12-01', subscription: 'basic', notes: 'Pantau area memasak' },
];

const SEED_CUSTOMERS = [
  { id: 1, name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890', address: 'Jl. Merdeka No.1, Jakarta Pusat', plan: 'premium', status: 'active', joinDate: '2024-01-10', cameraCount: 2, lastPayment: '2025-02-28', totalSpent: 2400000, avatar: 'BS' },
  { id: 2, name: 'Siti Rahayu', email: 'siti@email.com', phone: '082345678901', address: 'Jl. Sudirman No.5, Jakarta Selatan', plan: 'basic', status: 'active', joinDate: '2024-02-20', cameraCount: 2, lastPayment: '2025-02-28', totalSpent: 960000, avatar: 'SR' },
  { id: 3, name: 'PT Maju Bersama', email: 'admin@majubersama.co.id', phone: '083456789012', address: 'Jl. Gatot Subroto No.12, Jakarta Selatan', plan: 'enterprise', status: 'active', joinDate: '2024-03-05', cameraCount: 2, lastPayment: '2025-02-28', totalSpent: 7200000, avatar: 'MB' },
  { id: 4, name: 'Ahmad Hidayat', email: 'ahmad@email.com', phone: '084567890123', address: 'Jl. Ahmad Yani No.3, Bekasi', plan: 'basic', status: 'inactive', joinDate: '2024-04-12', cameraCount: 2, lastPayment: '2025-01-31', totalSpent: 480000, avatar: 'AH' },
  { id: 5, name: 'CV Sejahtera Jaya', email: 'info@sejahterajaya.com', phone: '085678901234', address: 'Jl. Raya Bogor No.50, Depok', plan: 'premium', status: 'active', joinDate: '2024-05-18', cameraCount: 0, lastPayment: '2025-02-28', totalSpent: 1800000, avatar: 'SJ' },
  { id: 6, name: 'Dewi Kusuma', email: 'dewi@email.com', phone: '086789012345', address: 'Jl. Pahlawan No.7, Tangerang', plan: 'basic', status: 'suspended', joinDate: '2024-06-22', cameraCount: 0, lastPayment: '2024-12-31', totalSpent: 360000, avatar: 'DK' },
];

const SEED_PAYMENTS = [
  { id: 1, invoiceNo: 'INV-2025-0001', customerId: 1, customerName: 'Budi Santoso', amount: 299000, plan: 'premium', method: 'transfer_bank', status: 'success', date: '2025-02-28', dueDate: '2025-03-28', description: 'Langganan Bulanan - Premium Plan' },
  { id: 2, invoiceNo: 'INV-2025-0002', customerId: 2, customerName: 'Siti Rahayu', amount: 99000, plan: 'basic', method: 'e_wallet', status: 'success', date: '2025-02-28', dueDate: '2025-03-28', description: 'Langganan Bulanan - Basic Plan' },
  { id: 3, invoiceNo: 'INV-2025-0003', customerId: 3, customerName: 'PT Maju Bersama', amount: 899000, plan: 'enterprise', method: 'virtual_account', status: 'success', date: '2025-02-28', dueDate: '2025-03-28', description: 'Langganan Bulanan - Enterprise Plan' },
  { id: 4, invoiceNo: 'INV-2025-0004', customerId: 4, customerName: 'Ahmad Hidayat', amount: 99000, plan: 'basic', method: 'qris', status: 'failed', date: '2025-02-01', dueDate: '2025-03-01', description: 'Langganan Bulanan - Basic Plan' },
  { id: 5, invoiceNo: 'INV-2025-0005', customerId: 5, customerName: 'CV Sejahtera Jaya', amount: 299000, plan: 'premium', method: 'transfer_bank', status: 'pending', date: '2025-03-01', dueDate: '2025-03-05', description: 'Langganan Bulanan - Premium Plan' },
  { id: 6, invoiceNo: 'INV-2025-0006', customerId: 6, customerName: 'Dewi Kusuma', amount: 99000, plan: 'basic', method: 'e_wallet', status: 'expired', date: '2024-12-31', dueDate: '2025-01-05', description: 'Langganan Bulanan - Basic Plan' },
  { id: 7, invoiceNo: 'INV-2025-0007', customerId: 1, customerName: 'Budi Santoso', amount: 299000, plan: 'premium', method: 'virtual_account', status: 'success', date: '2025-01-31', dueDate: '2025-02-28', description: 'Langganan Bulanan - Premium Plan' },
  { id: 8, invoiceNo: 'INV-2025-0008', customerId: 2, customerName: 'Siti Rahayu', amount: 99000, plan: 'basic', method: 'qris', status: 'success', date: '2025-01-31', dueDate: '2025-02-28', description: 'Langganan Bulanan - Basic Plan' },
  { id: 9, invoiceNo: 'INV-2025-0009', customerId: 3, customerName: 'PT Maju Bersama', amount: 899000, plan: 'enterprise', method: 'transfer_bank', status: 'success', date: '2025-01-31', dueDate: '2025-02-28', description: 'Langganan Bulanan - Enterprise Plan' },
  { id: 10, invoiceNo: 'INV-2025-0010', customerId: 5, customerName: 'CV Sejahtera Jaya', amount: 299000, plan: 'premium', method: 'e_wallet', status: 'success', date: '2025-01-31', dueDate: '2025-02-28', description: 'Langganan Bulanan - Premium Plan' },
];

const SEED_SUBSCRIPTIONS = [
  { id: 1, customerId: 1, customerName: 'Budi Santoso', plan: 'premium', startDate: '2024-01-10', endDate: '2025-03-28', status: 'active', autoRenew: true, cameraLimit: 10, storageGB: 500 },
  { id: 2, customerId: 2, customerName: 'Siti Rahayu', plan: 'basic', startDate: '2024-02-20', endDate: '2025-03-28', status: 'active', autoRenew: true, cameraLimit: 4, storageGB: 100 },
  { id: 3, customerId: 3, customerName: 'PT Maju Bersama', plan: 'enterprise', startDate: '2024-03-05', endDate: '2025-03-28', status: 'active', autoRenew: true, cameraLimit: 50, storageGB: 5000 },
  { id: 4, customerId: 4, customerName: 'Ahmad Hidayat', plan: 'basic', startDate: '2024-04-12', endDate: '2025-03-01', status: 'expired', autoRenew: false, cameraLimit: 4, storageGB: 100 },
  { id: 5, customerId: 5, customerName: 'CV Sejahtera Jaya', plan: 'premium', startDate: '2024-05-18', endDate: '2025-03-28', status: 'active', autoRenew: true, cameraLimit: 10, storageGB: 500 },
  { id: 6, customerId: 6, customerName: 'Dewi Kusuma', plan: 'basic', startDate: '2024-06-22', endDate: '2025-01-05', status: 'suspended', autoRenew: false, cameraLimit: 4, storageGB: 100 },
];

const SEED_ALERTS = [
  { id: 1, type: 'motion', cameraId: 1, cameraName: 'Kamera Depan Rumah', message: 'Gerakan terdeteksi', time: '2025-03-17 08:23:11', severity: 'medium', resolved: false },
  { id: 2, type: 'offline', cameraId: 3, cameraName: 'Kamera Belakang', message: 'Kamera tidak merespons', time: '2025-03-17 07:45:00', severity: 'high', resolved: false },
  { id: 3, type: 'storage', cameraId: 6, cameraName: 'Kamera Lobby Kantor', message: 'Penyimpanan hampir penuh (87%)', time: '2025-03-17 06:00:00', severity: 'medium', resolved: true },
  { id: 4, type: 'payment', cameraId: null, cameraName: null, message: 'Pembayaran INV-2025-0004 gagal', time: '2025-03-16 15:30:00', severity: 'high', resolved: false },
  { id: 5, type: 'offline', cameraId: 8, cameraName: 'Kamera Dapur', message: 'Kamera tidak merespons', time: '2025-03-16 12:00:00', severity: 'high', resolved: true },
];

const SEED_EMERGENCY = [
  { id: 1, name: 'Polisi Sektor Menteng', category: 'police', phone: '021-3141234', altPhone: '110', address: 'Jl. Cikini Raya No.1, Menteng, Jakarta Pusat', area: 'Jakarta Pusat', priority: 1, status: 'active', respondTime: '5-10 menit', notes: 'Piket 24 jam', createdAt: '2024-01-10', calledCount: 3, lastCalled: '2025-03-10 14:22:00' },
  { id: 2, name: 'Pemadam Kebakaran Jakarta Pusat', category: 'fire', phone: '021-6344565', altPhone: '113', address: 'Jl. Budi Kemuliaan No.5, Jakarta Pusat', area: 'Jakarta Pusat', priority: 1, status: 'active', respondTime: '8-15 menit', notes: 'Armada 3 unit', createdAt: '2024-01-10', calledCount: 1, lastCalled: '2024-12-01 09:00:00' },
  { id: 3, name: 'IGD RS Cipto Mangunkusumo', category: 'medical', phone: '021-3910210', altPhone: '119', address: 'Jl. Diponegoro No.71, Senen, Jakarta Pusat', area: 'Jakarta Pusat', priority: 1, status: 'active', respondTime: '10-20 menit', notes: 'Rumah sakit rujukan nasional', createdAt: '2024-01-15', calledCount: 2, lastCalled: '2025-02-14 20:15:00' },
  { id: 4, name: 'Satpam Komplek Sudirman', category: 'security', phone: '081298765432', altPhone: '', address: 'Pos Satpam Gerbang Utama, Jl. Sudirman No.1', area: 'Jakarta Selatan', priority: 2, status: 'active', respondTime: '2-5 menit', notes: 'Petugas on-site 24 jam', createdAt: '2024-02-20', calledCount: 7, lastCalled: '2025-03-15 03:30:00' },
  { id: 5, name: 'Polres Jakarta Selatan', category: 'police', phone: '021-5222900', altPhone: '110', address: 'Jl. Wijaya II No.1, Kebayoran Baru', area: 'Jakarta Selatan', priority: 2, status: 'active', respondTime: '10-20 menit', notes: '', createdAt: '2024-02-20', calledCount: 0, lastCalled: null },
  { id: 6, name: 'Ambulans Yayasan Ambulans Gawat Darurat', category: 'medical', phone: '021-65303118', altPhone: '119', address: 'Jl. Penjernihan I No.26, Bendungan Hilir', area: 'Jakarta', priority: 1, status: 'active', respondTime: '5-15 menit', notes: 'Layanan ambulans swasta', createdAt: '2024-03-05', calledCount: 1, lastCalled: '2025-01-20 11:00:00' },
  { id: 7, name: 'BPBD DKI Jakarta', category: 'disaster', phone: '021-1500044', altPhone: '112', address: 'Jl. Abdul Muis No.66, Gambir, Jakarta Pusat', area: 'Jakarta', priority: 1, status: 'active', respondTime: '15-30 menit', notes: 'Bencana & kedaruratan wilayah', createdAt: '2024-03-05', calledCount: 0, lastCalled: null },
  { id: 8, name: 'Security PT Maju Bersama', category: 'security', phone: '083456789099', altPhone: '', address: 'Jl. Gatot Subroto No.12, Jakarta Selatan', area: 'Jakarta Selatan', priority: 2, status: 'inactive', respondTime: '3-7 menit', notes: 'Khusus area gedung', createdAt: '2024-03-10', calledCount: 4, lastCalled: '2025-02-28 17:00:00' },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'jaga_rumah_data';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export const DataProvider = ({ children }) => {
  const stored = loadFromStorage();

  const [cameras, setCameras] = useState(stored?.cameras || SEED_CAMERAS);
  const [customers, setCustomers] = useState(stored?.customers || SEED_CUSTOMERS);
  const [payments, setPayments] = useState(stored?.payments || SEED_PAYMENTS);
  const [subscriptions, setSubscriptions] = useState(stored?.subscriptions || SEED_SUBSCRIPTIONS);
  const [alerts, setAlerts] = useState(stored?.alerts || SEED_ALERTS);
  const [emergencies, setEmergencies] = useState(stored?.emergencies || SEED_EMERGENCY);
  const [nextIds, setNextIds] = useState(stored?.nextIds || { camera: 9, customer: 7, payment: 11, subscription: 7, emergency: 9 });

  // Persist
  useEffect(() => {
    saveToStorage({ cameras, customers, payments, subscriptions, alerts, emergencies, nextIds });
  }, [cameras, customers, payments, subscriptions, alerts, emergencies, nextIds]);

  const nextId = useCallback((type) => {
    const id = nextIds[type];
    setNextIds(prev => ({ ...prev, [type]: prev[type] + 1 }));
    return id;
  }, [nextIds]);

  // ── CAMERAS ──────────────────────────────────────────────────────────────
  const addCamera = useCallback((data) => {
    const camera = { ...data, id: nextId('camera'), installedAt: new Date().toISOString().split('T')[0] };
    setCameras(prev => [...prev, camera]);
    return camera;
  }, [nextId]);

  const updateCamera = useCallback((id, data) => {
    setCameras(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCamera = useCallback((id) => {
    setCameras(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── CUSTOMERS ─────────────────────────────────────────────────────────────
  const addCustomer = useCallback((data) => {
    const customer = { ...data, id: nextId('customer'), joinDate: new Date().toISOString().split('T')[0], cameraCount: 0, totalSpent: 0 };
    setCustomers(prev => [...prev, customer]);
    return customer;
  }, [nextId]);

  const updateCustomer = useCallback((id, data) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCustomer = useCallback((id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setCameras(prev => prev.filter(c => c.userId !== id));
    setSubscriptions(prev => prev.filter(s => s.customerId !== id));
    setPayments(prev => prev.filter(p => p.customerId !== id));
  }, []);

  // ── PAYMENTS ──────────────────────────────────────────────────────────────
  const addPayment = useCallback((data) => {
    const payment = {
      ...data,
      id: nextId('payment'),
      invoiceNo: `INV-2025-${String(nextIds.payment).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [...prev, payment]);
    if (payment.status === 'success') {
      setCustomers(prev => prev.map(c =>
        c.id === payment.customerId
          ? { ...c, totalSpent: c.totalSpent + payment.amount, lastPayment: payment.date }
          : c
      ));
    }
    return payment;
  }, [nextId, nextIds.payment]);

  const updatePayment = useCallback((id, data) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deletePayment = useCallback((id) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────
  const addSubscription = useCallback((data) => {
    const sub = { ...data, id: nextId('subscription') };
    setSubscriptions(prev => [...prev, sub]);
    return sub;
  }, [nextId]);

  const updateSubscription = useCallback((id, data) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteSubscription = useCallback((id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── ALERTS ────────────────────────────────────────────────────────────────
  const resolveAlert = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, resolved: true })));
  }, []);

  // ── EMERGENCY CALLS ───────────────────────────────────────────────────────
  const addEmergency = useCallback((data) => {
    const item = { ...data, id: nextId('emergency'), createdAt: new Date().toISOString().split('T')[0], calledCount: 0, lastCalled: null };
    setEmergencies(prev => [...prev, item]);
    return item;
  }, [nextId]);

  const updateEmergency = useCallback((id, data) => {
    setEmergencies(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  const deleteEmergency = useCallback((id) => {
    setEmergencies(prev => prev.filter(e => e.id !== id));
  }, []);

  const recordCall = useCallback((id) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setEmergencies(prev => prev.map(e =>
      e.id === id ? { ...e, calledCount: e.calledCount + 1, lastCalled: now } : e
    ));
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    totalCameras: cameras.length,
    onlineCameras: cameras.filter(c => c.status === 'online').length,
    offlineCameras: cameras.filter(c => c.status === 'offline').length,
    maintenanceCameras: cameras.filter(c => c.status === 'maintenance').length,
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: payments.filter(p => p.status === 'success').reduce((a, b) => a + b.amount, 0),
    monthlyRevenue: payments.filter(p => p.status === 'success' && p.date.startsWith('2025-02')).reduce((a, b) => a + b.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    unresolvedAlerts: alerts.filter(a => !a.resolved).length,
    totalEmergencies: emergencies.length,
    activeEmergencies: emergencies.filter(e => e.status === 'active').length,
    totalCalls: emergencies.reduce((acc, e) => acc + (e.calledCount || 0), 0),
  };

  return (
    <DataContext.Provider value={{
      cameras, addCamera, updateCamera, deleteCamera,
      customers, addCustomer, updateCustomer, deleteCustomer,
      payments, addPayment, updatePayment, deletePayment,
      subscriptions, addSubscription, updateSubscription, deleteSubscription,
      alerts, resolveAlert, clearAlerts,
      emergencies, addEmergency, updateEmergency, deleteEmergency, recordCall,
      stats,
    }}>
      {children}
    </DataContext.Provider>
  );
};
