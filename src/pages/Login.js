import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@jagarumah.id', password: 'admin123' });
    else setForm({ email: 'operator@jagarumah.id', password: 'operator123' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${200 + i * 80}px`,
            height: `${200 + i * 80}px`,
            borderRadius: '50%',
            background: `rgba(59, 130, 246, ${0.03 + i * 0.01})`,
            border: `1px solid rgba(59, 130, 246, ${0.05 + i * 0.02})`,
            top: `${10 + i * 15}%`,
            left: `${5 + i * 10}%`,
          }} />
        ))}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }} />
      </div>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px',
        display: window.innerWidth < 900 ? 'none' : 'flex',
      }}>
        <div style={{ maxWidth: '460px', color: 'white' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
          }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
            Jaga Rumah
            <br />
            <span style={{ color: '#3b82f6' }}>CCTV Dashboard</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '40px' }}>
            Platform monitoring keamanan rumah & properti Anda secara real-time dengan teknologi AI terdepan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🎥', title: 'Monitor Real-time', desc: 'Pantau semua kamera CCTV dalam satu dashboard' },
              { icon: '🤖', title: 'AI Deteksi Cerdas', desc: 'Deteksi gerakan & wajah dengan kecerdasan buatan' },
              { icon: '💳', title: 'Payment Gateway', desc: 'Pembayaran langganan dengan berbagai metode' },
              { icon: '📊', title: 'Laporan Lengkap', desc: 'Analitik dan laporan data komprehensif' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{f.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px',
          background: 'white', borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Selamat Datang
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Masuk ke akun Jaga Rumah Anda
            </p>
          </div>

          {/* Demo credentials */}
          <div style={{
            background: '#f0f9ff', border: '1px solid #bae6fd',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '8px' }}>
              Demo Akun:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => fillDemo('admin')}
                style={{ fontSize: '0.75rem', padding: '4px 12px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Admin
              </button>
              <button
                onClick={() => fillDemo('operator')}
                style={{ fontSize: '0.75rem', padding: '4px 12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Operator
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#fff5f5', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '12px 14px',
                color: '#dc2626', fontSize: '0.875rem', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="email@jagarumah.id"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
                >
                  {showPass ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Memproses...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '24px' }}>
            © 2025 Jaga Rumah. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
