import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

function Header({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { stats, alerts } = useData();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const unresolvedAlerts = alerts.filter(a => !a.resolved).slice(0, 5);

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#64748b' }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
            }
          </svg>
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Jaga Rumah</span>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 600 }}>Dashboard</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '9999px',
          padding: '4px 12px',
          fontSize: '0.75rem',
          color: '#16a34a',
          fontWeight: 600,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'blink 2s infinite' }} />
          {stats.onlineCameras} Kamera Online
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            style={{
              background: showNotif ? '#f1f5f9' : 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px',
              color: '#64748b',
              position: 'relative',
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {stats.unresolvedAlerts > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, background: '#ef4444',
                borderRadius: '50%', border: '1.5px solid white',
              }} />
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '340px', background: 'white',
              borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0', zIndex: 200,
            }}>
              <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Peringatan</span>
                {stats.unresolvedAlerts > 0 && (
                  <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                    {stats.unresolvedAlerts} baru
                  </span>
                )}
              </div>
              {unresolvedAlerts.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                  Tidak ada peringatan baru
                </div>
              ) : (
                unresolvedAlerts.map(alert => (
                  <div key={alert.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                      background: alert.severity === 'high' ? '#ef4444' : '#f59e0b',
                    }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{alert.message}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{alert.time}</div>
                    </div>
                  </div>
                ))
              )}
              <div style={{ padding: '10px 16px' }}>
                <button
                  onClick={() => { navigate('/alerts'); setShowNotif(false); }}
                  style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600, cursor: 'pointer' }}
                >
                  Lihat Semua
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: showUser ? '#f1f5f9' : 'none', border: 'none',
              cursor: 'pointer', padding: '6px 10px 6px 6px',
              borderRadius: '10px',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.75rem',
            }}>
              {user?.avatar}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{user?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUser && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '200px', background: 'white',
              borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</div>
              </div>
              {[
                { label: 'Profil Saya', to: '/settings', icon: '👤' },
                { label: 'Pengaturan', to: '/settings', icon: '⚙️' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.to); setShowUser(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#374151', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#ef4444', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>🚪</span> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
