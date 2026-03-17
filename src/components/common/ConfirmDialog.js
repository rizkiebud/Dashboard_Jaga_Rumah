import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Hapus', confirmClass = 'btn btn-danger', loading = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Memproses...
              </>
            ) : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '0.9375rem', color: '#1e293b', lineHeight: 1.6 }}>{message}</p>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 6 }}>Tindakan ini tidak dapat dibatalkan.</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
