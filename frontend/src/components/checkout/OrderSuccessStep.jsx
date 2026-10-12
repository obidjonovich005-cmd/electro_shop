import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../services/api';

export default function OrderSuccessStep({
  fullName,
  createdOrder,
  region,
  district,
  streetAddress,
  phone,
  paymentMethod,
  onClose,
}) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 10px' }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
        }}
      >
        <CheckCircle2 size={44} color="var(--accent-success)" />
      </div>

      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
        Buyurtmangiz qabul qilindi! 🎉
      </h2>
      <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
        Rahmat, <strong style={{ color: '#fff' }}>{fullName}</strong>! Buyurtmangiz <strong>#{createdOrder?.id}</strong> tizimga kiritildi. Operatorimiz tez orada bog'lanadi.
      </p>

      {/* Chek kartasi */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: 18,
          textAlign: 'left',
          marginBottom: 24,
          fontSize: '0.88rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-dim)' }}>Viloyat:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{region}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-dim)' }}>Tuman:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{district}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-dim)' }}>Manzil:</span>
          <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{streetAddress}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-dim)' }}>Telefon:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{phone}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-dim)' }}>To'lov usuli:</span>
          <span style={{ color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>{paymentMethod}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
          <span style={{ color: 'var(--text-dim)' }}>Jami:</span>
          <span style={{ color: 'var(--accent-success)', fontWeight: 800, fontSize: '1rem' }}>
            {formatPrice(createdOrder?.total_price)}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="btn btn-primary"
        style={{ padding: '12px 32px', borderRadius: 'var(--radius-full)', fontSize: '0.95rem' }}
      >
        Do'konga qaytish
      </button>
    </div>
  );
}
