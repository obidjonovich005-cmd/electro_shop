import React, { useState } from 'react';
import { CreditCard, ArrowLeft, Loader2, ExternalLink, Zap, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../services/api';

export default function PaymentCardStep({
  createdOrder,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardHolder,
  setCardHolder,
  loading,
  errorMsg,
  onSubmit,
  onBack,
}) {
  // Karta raqamini formatlash: 8600 0000 0000 0000
  const formatCardInput = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    const parts = cleaned.match(/.{1,4}/g);
    return parts ? parts.join(' ') : cleaned;
  };

  // Karta muddati validatsiyasi
  const getExpiryValidation = (val) => {
    if (!val || val.length < 5) return { valid: false, error: '' };
    const [mmStr, yyStr] = val.split('/');
    const mm = parseInt(mmStr, 10);
    const yy = parseInt(yyStr, 10);

    if (isNaN(mm) || mm < 1 || mm > 12) {
      return { valid: false, error: "Noto'g'ri oy (01 dan 12 gacha bo'lishi kerak)" };
    }

    const now = new Date();
    const curYear = now.getFullYear() % 100; // masalan 26
    const curMonth = now.getMonth() + 1; // 1-12

    if (isNaN(yy)) {
      return { valid: false, error: "Yil noto'g'ri kiritildi" };
    }

    if (yy < curYear || (yy === curYear && mm < curMonth)) {
      return { valid: false, error: "⚠️ Karta muddati tugagan!" };
    }

    if (yy > curYear + 10) {
      return { valid: false, error: "⚠️ Karta muddati juda uzoq (maksimal 10 yil)" };
    }

    return { valid: true, error: '' };
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 4) raw = raw.slice(0, 4);

    if (raw.length === 1 && parseInt(raw, 10) > 1) {
      raw = '0' + raw;
    }

    if (raw.length >= 2) {
      const monthPart = parseInt(raw.slice(0, 2), 10);
      let validMonth = raw.slice(0, 2);
      if (monthPart > 12) {
        validMonth = '12';
      } else if (monthPart === 0) {
        validMonth = '01';
      }
      raw = validMonth + raw.slice(2);
    }

    if (raw.length >= 3) {
      setCardExpiry(raw.slice(0, 2) + '/' + raw.slice(2, 4));
    } else {
      setCardExpiry(raw);
    }
  };

  const expiryCheck = getExpiryValidation(cardExpiry);

  const handleFillTestCard = () => {
    setCardNumber('8600 4912 3456 7890');
    setCardExpiry('12/28');
    setCardHolder('TEST MIJOZ');
  };

  const method = createdOrder?.payment_method?.toLowerCase() || 'click';
  const orderAmount = Math.round(Number(createdOrder?.total_price || 0));
  const clickPayUrl = `https://my.click.uz/services/pay?service_id=24500&merchant_id=18400&amount=${orderAmount}&transaction_param=${createdOrder?.id || 1}`;
  let paymePayUrl = '#';
  try {
    paymePayUrl = `https://checkout.paycom.uz/${btoa(`m=64a938fe7812;ac.order_id=${createdOrder?.id || 1};a=${orderAmount * 100}`)}`;
  } catch (err) {
    paymePayUrl = '#';
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <span className="badge badge-new" style={{ marginBottom: 8 }}>
          Buyurtma #{createdOrder?.id}
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
          Onlayn To'lov ({createdOrder?.payment_method?.toUpperCase()})
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          To'lov summasi: <strong style={{ color: '#38bdf8' }}>{formatPrice(createdOrder?.total_price)}</strong>
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Direct App Payment Link Banner */}
      {(method === 'click' || method === 'payme') && (
        <div
          style={{
            background: method === 'click'
              ? 'linear-gradient(135deg, rgba(0, 163, 224, 0.15) 0%, rgba(0, 114, 206, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(0, 205, 172, 0.15) 0%, rgba(31, 147, 255, 0.08) 100%)',
            border: `1px solid ${method === 'click' ? 'rgba(0, 163, 224, 0.35)' : 'rgba(0, 205, 172, 0.35)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: 2 }}>
              {method === 'click' ? 'Click Up ilovasi orqali to\'lash' : 'Payme ilovasi orqali to\'lash'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Ilovani ochib bir bosishda to'lovni tasdiqlashingiz mumkin
            </div>
          </div>
          <a
            href={method === 'click' ? clickPayUrl : paymePayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              background: method === 'click' ? '#00a3e0' : '#00cdac',
              borderColor: method === 'click' ? '#00a3e0' : '#00cdac',
              color: method === 'click' ? '#fff' : '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Ilovada ochish <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Quick Test Card Auto-fill Helper */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          type="button"
          onClick={handleFillTestCard}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 10px',
            fontSize: '0.75rem',
            color: '#93c5fd',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Zap size={13} /> Test kartasini to'ldirish (8600 ••••)
        </button>
      </div>

      {/* Virtual Card Preview */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 15px 35px rgba(49, 46, 129, 0.4)',
          color: '#fff',
          marginBottom: 20,
          userSelect: 'none',
        }}
      >
        {/* Card top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8 }}>
            {createdOrder?.payment_method?.toUpperCase()} ONLINE
          </span>
          <CreditCard size={28} />
        </div>

        {/* Card number */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '1.35rem',
            letterSpacing: 4,
            marginBottom: 28,
            color: cardNumber ? '#fff' : 'rgba(255,255,255,0.35)',
          }}
        >
          {cardNumber ? cardNumber.padEnd(19, ' ') : '•••• •••• •••• ••••'}
        </div>

        {/* Card bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.62rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
              Karta egasi
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: 1,
                color: cardHolder ? '#fff' : 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace',
              }}
            >
              {cardHolder ? cardHolder.toUpperCase() : '•••• ••••••••'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
              Amal qilish
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: cardExpiry ? '#fff' : 'rgba(255,255,255,0.3)',
              }}
            >
              {cardExpiry || '••/••'}
            </div>
          </div>
        </div>
      </div>

      {/* Card Inputs */}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Karta raqami */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
            Karta raqami (Uzcard / Humo / Visa) *
          </label>
          <input
            type="text"
            maxLength={19}
            placeholder="8600 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
            autoFocus
            className="form-input"
          />
        </div>

        {/* Karta egasi */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
            Karta egasi (kartadagi ism)
          </label>
          <input
            type="text"
            placeholder="ISM FAMILIYA (lotin harflarda)"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.replace(/[^a-zA-Z ']/g, ''))}
            className="form-input"
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        {/* Muddati va SMS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
              Amal qilish muddati (MM/YY) *
            </label>
            <input
              type="text"
              maxLength={5}
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={handleExpiryChange}
              className="form-input"
              style={{
                borderColor: cardExpiry.length === 5
                  ? (expiryCheck.valid ? '#10b981' : '#ef4444')
                  : undefined,
              }}
            />
            {cardExpiry.length === 5 && !expiryCheck.valid && (
              <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4, fontWeight: 600 }}>
                {expiryCheck.error}
              </div>
            )}
            {cardExpiry.length === 5 && expiryCheck.valid && (
              <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 4, fontWeight: 600 }}>
                ✓ Muddat to'g'ri
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
              SMS kod (avtomatik)
            </label>
            <input
              type="password"
              disabled
              placeholder="••••"
              value="1234"
              className="form-input"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            <ArrowLeft size={16} /> Orqaga
          </button>
          <button
            type="submit"
            disabled={loading || !cardNumber || (cardExpiry.length > 0 && !expiryCheck.valid)}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px 20px', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> To'lov o'tkazilmoqda...
              </>
            ) : (
              `To'lovni tasdiqlash (${formatPrice(createdOrder?.total_price)})`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
