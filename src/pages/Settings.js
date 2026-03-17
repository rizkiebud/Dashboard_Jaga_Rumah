import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

function Settings() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [notifSettings, setNotifSettings] = useState({
    emailAlert: true,
    smsAlert: false,
    cameraOffline: true,
    motionDetect: true,
    paymentDue: true,
    reportWeekly: false,
  });
  const [systemSettings, setSystemSettings] = useState({
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'dd/MM/yyyy',
    recordingQuality: 'high',
    retentionDays: 30,
    autoBackup: true,
  });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { key: 'profile', label: 'Profil', icon: '👤' },
    { key: 'security', label: 'Keamanan', icon: '🔒' },
    { key: 'notifications', label: 'Notifikasi', icon: '🔔' },
    { key: 'system', label: 'Sistem', icon: '⚙️' },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    const initials = profileForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    updateProfile({ ...profileForm, avatar: initials });
    toast.success('Profil berhasil diperbarui');
    setSaving(false);
  };

  const handleChangePass = async () => {
    if (!passForm.current || !passForm.newPass || !passForm.confirm) { toast.error('Semua field wajib diisi'); return; }
    if (passForm.newPass !== passForm.confirm) { toast.error('Password baru tidak cocok'); return; }
    if (passForm.newPass.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setPassForm({ current: '', newPass: '', confirm: '' });
    toast.success('Password berhasil diubah');
    setSaving(false);
  };

  const toggleNotif = (key) => {
    setNotifSettings(s => ({ ...s, [key]: !s[key] }));
    toast.info('Pengaturan notifikasi disimpan');
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{label}</div>
        {description && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{description}</div>}
      </div>
      <button
        onClick={onChange}
        style={{
          width: '44px', height: '24px', borderRadius: '9999px',
          background: checked ? '#1e40af' : '#e2e8f0', border: 'none',
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%', background: 'white',
          position: 'absolute', top: '3px',
          left: checked ? '23px' : '3px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-subtitle">Kelola profil dan konfigurasi sistem</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        {/* Sidebar Tabs */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)', height: 'fit-content' }}>
          {/* User Info */}
          <div style={{ padding: '16px 12px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', margin: '0 auto 10px' }}>
              {user?.avatar}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>

          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === tab.key ? '#dbeafe' : 'none',
                color: activeTab === tab.key ? '#1d4ed8' : '#475569',
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: '0.875rem', marginBottom: '2px',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)' }}>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Informasi Profil</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nama Lengkap</label>
                  <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">No. Telepon</label>
                  <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" value={user?.role} disabled style={{ background: '#f8fafc', color: '#94a3b8', textTransform: 'capitalize' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bergabung</label>
                  <input className="form-input" value={user?.createdAt || '-'} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <><div className="spinner" />Menyimpan...</> : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Keamanan Akun</h3>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '16px' }}>Ubah Password</h4>
                <div className="form-group">
                  <label className="form-label">Password Saat Ini</label>
                  <input type="password" className="form-input" value={passForm.current} onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Password Baru</label>
                    <input type="password" className="form-input" value={passForm.newPass} onChange={e => setPassForm(f => ({ ...f, newPass: e.target.value }))} placeholder="Min. 6 karakter" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Konfirmasi Password</label>
                    <input type="password" className="form-input" value={passForm.confirm} onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Ulangi password" />
                  </div>
                </div>
                <button className="btn btn-warning" onClick={handleChangePass} disabled={saving}>
                  {saving ? <><div className="spinner" />Memproses...</> : '🔐 Ubah Password'}
                </button>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>Sesi Aktif</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.5rem' }}>💻</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>Chrome - Windows 11</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sesi ini · Jakarta, Indonesia</div>
                  </div>
                  <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>Aktif</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Pengaturan Notifikasi</h3>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Channel Notifikasi</h4>
                <ToggleSwitch checked={notifSettings.emailAlert} onChange={() => toggleNotif('emailAlert')} label="Notifikasi Email" description="Kirim peringatan ke alamat email terdaftar" />
                <ToggleSwitch checked={notifSettings.smsAlert} onChange={() => toggleNotif('smsAlert')} label="Notifikasi SMS" description="Kirim peringatan via SMS (biaya operator berlaku)" />
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Jenis Peringatan</h4>
                <ToggleSwitch checked={notifSettings.cameraOffline} onChange={() => toggleNotif('cameraOffline')} label="Kamera Offline" description="Notifikasi saat kamera terputus" />
                <ToggleSwitch checked={notifSettings.motionDetect} onChange={() => toggleNotif('motionDetect')} label="Deteksi Gerakan" description="Notifikasi saat ada aktivitas mencurigakan" />
                <ToggleSwitch checked={notifSettings.paymentDue} onChange={() => toggleNotif('paymentDue')} label="Tagihan Jatuh Tempo" description="Ingatkan 3 hari sebelum jatuh tempo" />
                <ToggleSwitch checked={notifSettings.reportWeekly} onChange={() => toggleNotif('reportWeekly')} label="Laporan Mingguan" description="Ringkasan aktivitas sistem setiap minggu" />
              </div>
            </div>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Pengaturan Sistem</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Bahasa</label>
                  <select className="form-select" value={systemSettings.language} onChange={e => setSystemSettings(s => ({ ...s, language: e.target.value }))}>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Zona Waktu</label>
                  <select className="form-select" value={systemSettings.timezone} onChange={e => setSystemSettings(s => ({ ...s, timezone: e.target.value }))}>
                    <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                    <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                    <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kualitas Rekaman</label>
                  <select className="form-select" value={systemSettings.recordingQuality} onChange={e => setSystemSettings(s => ({ ...s, recordingQuality: e.target.value }))}>
                    <option value="low">Rendah (720p)</option>
                    <option value="medium">Sedang (1080p)</option>
                    <option value="high">Tinggi (4K)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Retensi Rekaman (hari)</label>
                  <input type="number" className="form-input" value={systemSettings.retentionDays} onChange={e => setSystemSettings(s => ({ ...s, retentionDays: Number(e.target.value) }))} min={7} max={90} />
                </div>
              </div>

              <ToggleSwitch
                checked={systemSettings.autoBackup}
                onChange={() => { setSystemSettings(s => ({ ...s, autoBackup: !s.autoBackup })); toast.info('Pengaturan disimpan'); }}
                label="Backup Otomatis"
                description="Backup data rekaman ke cloud setiap hari"
              />

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => toast.success('Pengaturan sistem disimpan')}>
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
