import React from 'react';
import { MessageSquare, ShieldCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function OtpStep({
  phone,
  otpCode,
  setOtpCode,
  otpLoading,
  otpError,
  otpSuccess,
  resendCountdown,
  onVerify,
  onResend,
  onBack,
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          border: '2px solid rgba(99,102,241,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 30px rgba(99,102,241,0.25)',
        }}
      >
        <MessageSquare size={34} color="var(--accent-primary)" />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
        SMS Tasdiqlash
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 6 }}>
        <strong style={{ color: '#818cf8' }}>{phone}</strong> raqamiga
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 28 }}>
        6 xonali tasdiqlash kodi yuborildi. Iltimos, kiriting:
      </p>

      <form onSubmit={onVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* OTP input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="_ _ _ _ _ _"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
            autoFocus
            className="form-input"
            style={{
              textAlign: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '0.5rem',
              padding: '16px',
              fontFamily: 'monospace',
              border: otpError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(99,102,241,0.4)',
              boxShadow: otpError ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(99,102,241,0.12)',
            }}
          />
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i < otpCode.length ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s',
                boxShadow: i < otpCode.length ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Error */}
        {otpError && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            {otpError}
          </div>
        )}

        {/* Success */}
        {otpSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#34d399',
              fontSize: '0.85rem',
            }}
          >
            <ShieldCheck size={16} /> {otpSuccess}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={otpLoading || otpCode.length < 6}
          className="btn btn-primary"
          style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
        >
          {otpLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Tekshirilmoqda...
            </>
          ) : (
            <>
              <ShieldCheck size={18} /> Tasdiqlash
            </>
          )}
        </button>

        {/* Actions row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={14} /> Orqaga
          </button>

          <button
            type="button"
            onClick={onResend}
            disabled={resendCountdown > 0 || otpLoading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: resendCountdown > 0 ? 'default' : 'pointer',
              color: resendCountdown > 0 ? 'var(--text-dim)' : 'var(--accent-secondary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '8px',
            }}
          >
            <RefreshCw size={14} />
            {resendCountdown > 0 ? `Qayta yuborish (${resendCountdown}s)` : 'Qayta yuborish'}
          </button>
        </div>
      </form>
    </div>
  );
}
