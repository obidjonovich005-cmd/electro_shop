import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitCheckout, submitOrderPayment, formatPrice, sendOTP, verifyOTP } from '../services/api';
import { UZ_REGIONS } from '../data/regionsData';
import OtpStep from './checkout/OtpStep';
import PaymentCardStep from './checkout/PaymentCardStep';
import OrderSuccessStep from './checkout/OrderSuccessStep';

const SelectBox = ({ label, value, onChange, options, placeholder, required }) => (
  <div>
    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
      {label} {required && '*'}
    </label>
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.9)',
          border: `1px solid ${value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '11px 40px 11px 14px',
          color: value ? '#f8fafc' : '#64748b',
          fontFamily: 'var(--font-main)',
          fontSize: '0.92rem',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          transition: 'border-color 0.2s',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: '#0f172a', color: '#f8fafc' }}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-dim)',
          pointerEvents: 'none',
        }}
      />
    </div>
  </div>
);

const CheckoutModal = ({ isOpen, onClose, onOrderSuccess, initialInstallmentPlan = null }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState('details'); // 'details' | 'otp' | 'payment' | 'success'
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Form holatlari
  const [fullName, setFullName] = useState(user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
  const [phone, setPhone] = useState(user?.phone || '+998 ');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(initialInstallmentPlan ? 'uzum' : 'click');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [installmentPlan, setInstallmentPlan] = useState(initialInstallmentPlan);

  // OTP holatlari
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (initialInstallmentPlan) {
      setInstallmentPlan(initialInstallmentPlan);
      setPaymentMethod('uzum');
    }
  }, [initialInstallmentPlan]);

  const startCountdown = (seconds = 60) => {
    setResendCountdown(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(countdownRef.current), []);

  if (!isOpen) return null;

  const districtOptions = region ? UZ_REGIONS[region] || [] : [];
  const fullAddress = [region, district, streetAddress].filter(Boolean).join(', ');

  const isTashkent = region ? region.toLowerCase().includes('toshkent') : false;
  const isFreeDelivery = region
    ? isTashkent
      ? cartTotal >= 500000
      : cartTotal >= 1000000
    : false;

  const deliveryFee = region
    ? isFreeDelivery
      ? 0
      : isTashkent
      ? 20000
      : 40000
    : 0;

  const finalTotal = cartTotal + deliveryFee;

  const handleRegionChange = (val) => {
    setRegion(val);
    setDistrict('');
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !region || !district || !streetAddress.trim()) {
      setErrorMsg("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await sendOTP(phone);
      setOtpError('');
      if (res?.dev_code) {
        setOtpCode(res.dev_code);
        setOtpSuccess(`Test kodi avtomatik to'ldirildi: ${res.dev_code}`);
      } else {
        setOtpCode('');
        setOtpSuccess('');
      }
      startCountdown(60);
      setStep('otp');
    } catch (err) {
      const msg = err.response?.data?.error || 'SMS yuborishda xatolik yuz berdi.';
      const wait = err.response?.data?.wait_seconds;
      if (wait) {
        setErrorMsg(`${msg} (${wait} soniya kuting)`);
        startCountdown(wait);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setOtpError("Iltimos, 6 xonali kodni to'liq kiriting!");
      return;
    }
    setOtpLoading(true);
    setOtpError('');

    try {
      await verifyOTP(phone, otpCode);
      setOtpSuccess('Telefon tasdiqlandi! Buyurtma yaratilmoqda...');

      const itemsPayload = cart.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }));

      const order = await submitCheckout({
        full_name: fullName,
        phone,
        address: fullAddress,
        comment,
        payment_method: paymentMethod,
        items: itemsPayload,
        delivery_fee: deliveryFee,
      });

      setCreatedOrder(order);
      clearCart();

      if (paymentMethod === 'cash') {
        setStep('success');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        if (onOrderSuccess) onOrderSuccess(order);
      } else {
        setStep('payment');
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Tasdiqlashda xatolik yuz berdi.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setOtpLoading(true);
    setOtpError('');
    setOtpCode('');
    try {
      const res = await sendOTP(phone);
      if (res?.dev_code) {
        setOtpCode(res.dev_code);
        setOtpSuccess(`Test kodi qayta to'ldirildi: ${res.dev_code}`);
      } else {
        setOtpSuccess('OTP kodi qayta yuborildi!');
      }
      startCountdown(60);
      setTimeout(() => setOtpSuccess(''), 4000);
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Qayta yuborishda xatolik.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!createdOrder) return;

    setLoading(true);
    try {
      await submitOrderPayment(createdOrder.id, {
        action: 'confirm_payment',
        card_number: cardNumber || '8600 1234 5678 9012',
      });

      setStep('success');
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      if (onOrderSuccess) onOrderSuccess(createdOrder);
    } catch (err) {
      setErrorMsg("To'lovni tasdiqlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1030 }}>
      <div
        className="modal-content checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: step === 'payment' ? 560 : 660, position: 'relative' }}
      >
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* ═══ 1. OTP: SMS Tasdiqlash ═══ */}
        {step === 'otp' && (
          <OtpStep
            phone={phone}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            otpLoading={otpLoading}
            otpError={otpError}
            otpSuccess={otpSuccess}
            resendCountdown={resendCountdown}
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
            onBack={() => {
              setStep('details');
              setOtpCode('');
              setOtpError('');
              clearInterval(countdownRef.current);
            }}
          />
        )}

        {/* ═══ 2. Details: Ma'lumotlarni to'ldirish ═══ */}
        {step === 'details' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                Buyurtmani rasmiylashtirish
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Yetkazib berish ma'lumotlarini to'ldiring va qulay to'lov turini tanlang.
              </p>
            </div>

            {/* Agar bo'lib to'lash (Nasiya) tanlangan bo'lsa */}
            {installmentPlan && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    💳 Tanlangan muddatli to'lov (Uzum Nasiya):
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 2 }}>
                    <strong>{installmentPlan.months} oyga</strong> bo'lib to'lash • Oyiga <strong>{formatPrice(installmentPlan.monthly)}</strong> dan
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(99,102,241,0.2)',
                    color: '#818cf8',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {installmentPlan.months} OY
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Ism va telefon */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                    Ism va Familiyangiz *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Sardor Aliyev"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                    Telefon raqam *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Manzil (Viloyat va tuman) */}
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <MapPin size={15} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8' }}>
                    Yetkazib berish manzili
                  </span>
                </div>

                <SelectBox
                  label="Viloyat / Shahar"
                  value={region}
                  onChange={handleRegionChange}
                  options={Object.keys(UZ_REGIONS)}
                  placeholder="— Viloyatni tanlang —"
                  required
                />

                <SelectBox
                  label="Tuman / Shahar"
                  value={district}
                  onChange={setDistrict}
                  options={districtOptions}
                  placeholder={region ? '— Tumanni tanlang —' : '— Avval viloyatni tanlang —'}
                  required
                />

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                    Ko'cha, uy / kvartira *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ko'cha nomi, uy raqami, xonadon..."
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="form-input"
                  />
                </div>

                {fullAddress && (
                  <div
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                    }}
                  >
                    <MapPin size={13} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span><strong>To'liq manzil:</strong> {fullAddress}</span>
                  </div>
                )}
              </div>

              {/* Qo'shimcha izoh */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                  Qo'shimcha izoh (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 3-podyezd, 12-xonadon"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* To'lov usuli tanlash */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 10, display: 'block' }}>
                  To'lov usulini tanlang:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {[
                    { id: 'click', name: 'Click Up', desc: "Kartadan onlayn to'lov", color: '#0073ff' },
                    { id: 'payme', name: 'Payme', desc: "Tezkor to'lov tizimi", color: '#00cccc' },
                    { id: 'uzum', name: 'Uzum Bank', desc: 'Uzum nasiya & karta', color: '#7b2cbf' },
                    { id: 'cash', name: 'Yetkazilganda naqd', desc: 'Kuryer orqali qabul qilish', color: '#10b981' },
                  ].map((m) => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{m.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jami va Tasdiqlash tugmasi */}
              <div
                className="checkout-summary-footer"
                style={{
                  padding: '14px 18px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 4,
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      Yetkazib berish:{' '}
                      <strong style={{ color: deliveryFee === 0 && region ? '#34d399' : '#cbd5e1' }}>
                        {!region ? "Viloyat tanlanganda" : deliveryFee === 0 ? "Bepul 🎉" : formatPrice(deliveryFee)}
                      </strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                    {formatPrice(finalTotal)}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary checkout-submit-btn"
                  style={{ padding: '12px 24px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Yuborilmoqda...
                    </>
                  ) : paymentMethod === 'cash' ? (
                    'Buyurtmani tasdiqlash'
                  ) : (
                    "To'lovga o'tish"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ 3. Payment: Karta bilan to'lov ═══ */}
        {step === 'payment' && (
          <PaymentCardStep
            createdOrder={createdOrder}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            cardExpiry={cardExpiry}
            setCardExpiry={setCardExpiry}
            cardHolder={cardHolder}
            setCardHolder={setCardHolder}
            loading={loading}
            errorMsg={errorMsg}
            onSubmit={handleCardPayment}
            onBack={() => setStep('details')}
          />
        )}

        {/* ═══ 4. Success: Muvaffaqiyatli yakunlash ═══ */}
        {step === 'success' && (
          <OrderSuccessStep
            fullName={fullName}
            createdOrder={createdOrder}
            region={region}
            district={district}
            streetAddress={streetAddress}
            phone={phone}
            paymentMethod={paymentMethod}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
