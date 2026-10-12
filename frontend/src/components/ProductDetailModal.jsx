import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, Check, Heart, Cpu } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchProductDetail, formatPrice } from '../services/api';

import { getProductImage } from '../utils/productImages';

const ProductDetailModal = ({ productSlug, onClose, onSelectRelated, onProceedInstallment }) => {
  const { addToCart, toggleWishlist, isWishlisted, openCart } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(3);

  useEffect(() => {
    if (!productSlug) return;
    setLoading(true);
    fetchProductDetail(productSlug)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [productSlug]);

  if (!productSlug) return null;

  const product = data?.product;
  const related = data?.related || [];
  const wishlisted = product ? isWishlisted(product.id) : false;
  const detailImageUrl = getProductImage(product);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    onClose();
    openCart();
  };

  const handleInstallmentBuy = (plan) => {
    if (!product) return;
    addToCart(product, quantity);
    onClose();
    if (onProceedInstallment) {
      onProceedInstallment(plan);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, padding: 32, position: 'relative' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {loading || !product ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div className="animate-pulse-glow" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 16px' }} />
            Mahsulot ma'lumotlari yuklanmoqda...
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, alignItems: 'flex-start' }}>
              {/* Product Image Stage */}
              <div>
                <div style={{
                  borderRadius: 'var(--radius-lg)',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  height: 320,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                  position: 'relative'
                }}>
                  <img
                    src={detailImageUrl}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = detailImageUrl;
                    }}
                    style={{
                      maxHeight: '90%',
                      maxWidth: '90%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))'
                    }}
                  />
                  {product.discount_percent > 0 && (
                    <span 
                      className="badge badge-discount" 
                      style={{ position: 'absolute', top: 16, left: 16, fontSize: '0.8rem' }}
                    >
                      -{product.discount_percent}% Chegirma
                    </span>
                  )}
                </div>

                {/* Trust guarantee bullets */}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={16} color="var(--accent-success)" />
                    <span>Rasmiy kafolat (12 oy)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={16} color="var(--accent-secondary)" />
                    <span>Bugunoq bepul kuryer orqali yetkazish</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RotateCcw size={16} color="var(--accent-warning)" />
                    <span>14 kun ichida almashtirish kafolati</span>
                  </div>
                </div>
              </div>

              {/* Product Info & Actions */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase' }}>
                    {product.brand || 'Original'}
                  </span>
                  <span style={{ color: 'var(--text-dim)' }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: '0.85rem' }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontWeight: 700 }}>{product.rating}</span>
                    <span style={{ color: 'var(--text-dim)' }}>({product.reviews_count} ta sharh)</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, marginBottom: 12 }}>
                  {product.name}
                </h2>

                {/* Price block */}
                <div style={{
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                    {formatPrice(product.current_price || product.price)}
                  </div>
                  {product.discount_price && product.discount_price < product.price && (
                    <div style={{ fontSize: '1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>

                {/* Nasiya kalkulyator */}
                {(() => {
                  const price = Number(product.current_price || product.price);
                  const plans = [
                    { months: 3, rate: 0, tag: '0% Foizsiz' },
                    { months: 6, rate: 0.04, tag: '+4%' },
                    { months: 12, rate: 0.08, tag: '+8%' },
                  ];
                  const currentPlan = plans.find(p => p.months === selectedMonths) || plans[0];
                  const currentTotal = price * (1 + currentPlan.rate);
                  const currentMonthly = Math.round(currentTotal / currentPlan.months);

                  return (
                    <div style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                          💳 Muddatli to'lov (Uzum / Payme Nasiya)
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Muddatni tanlang:
                        </span>
                      </div>

                      {/* 3 ta bosiladigan reja */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                        {plans.map(({ months, rate, tag }) => {
                          const total = price * (1 + rate);
                          const monthly = Math.round(total / months);
                          const isSelected = selectedMonths === months;

                          return (
                            <div
                              key={months}
                              onClick={() => setSelectedMonths(months)}
                              style={{
                                textAlign: 'center',
                                padding: '10px 6px',
                                cursor: 'pointer',
                                background: isSelected
                                  ? 'rgba(99,102,241,0.22)'
                                  : (rate === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)'),
                                border: isSelected
                                  ? '2px solid #818cf8'
                                  : `1px solid ${rate === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: isSelected ? '0 0 14px rgba(99,102,241,0.35)' : 'none',
                                position: 'relative',
                              }}
                            >
                              {isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -4,
                                  background: '#818cf8',
                                  color: '#0f172a',
                                  fontSize: '0.6rem',
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: 8,
                                }}>
                                  ✓ Tanlandi
                                </div>
                              )}
                              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isSelected ? '#a5b4fc' : 'var(--text-dim)', marginBottom: 3 }}>
                                {months} oy ({tag})
                              </div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? '#ffffff' : (rate === 0 ? '#34d399' : '#fff') }}>
                                {formatPrice(monthly)}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>/oy</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tanlangan reja bilan nasiyaga olish tugmasi */}
                      <button
                        type="button"
                        onClick={() => handleInstallmentBuy({
                          months: selectedMonths,
                          monthly: currentMonthly,
                          total: currentTotal,
                          rate: currentPlan.rate,
                        })}
                        disabled={product.stock <= 0}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                          transition: 'transform 0.15s',
                        }}
                      >
                        💳 {selectedMonths} oyga bo'lib to'lash ({formatPrice(currentMonthly)}/oy)
                      </button>
                    </div>
                  );
                })()}

                {/* Specs Box */}
                {product.specs && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Cpu size={15} color="var(--accent-primary)" /> Texnik xususiyatlari:
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      lineHeight: 1.5
                    }}>
                      {product.specs}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                    Tavsifi:
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, maxHeight: 110, overflowY: 'auto' }}>
                    {product.description}
                  </p>
                </div>

                {/* Stock status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Holati:</span>
                  {product.stock > 0 ? (
                    <span className="badge badge-stock">
                      Omborda {product.stock} dona mavjud
                    </span>
                  ) : (
                    <span className="badge badge-out">
                      Hozirda sotuvda mavjud emas
                    </span>
                  )}
                </div>

                {/* Quantity & CTA buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {/* Quantity selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: 4
                  }}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ width: 32, height: 32, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ width: 36, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                      style={{ width: 32, height: 32, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`btn ${added ? 'btn-cyan' : 'btn-primary'}`}
                    style={{ flex: 1, padding: '12px 18px', fontSize: '0.95rem' }}
                  >
                    {added ? (
                      <>
                        <Check size={18} /> Savatga qo'shildi
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} /> Savatga qo'shish
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id, product)}
                    className="btn-icon"
                    style={{ width: 44, height: 44 }}
                  >
                    <Heart size={20} color={wishlisted ? '#f43f5e' : '#fff'} fill={wishlisted ? '#f43f5e' : 'none'} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '12px 18px', fontSize: '0.95rem', borderColor: 'var(--accent-primary)' }}
                >
                  ⚡ Hoziroq bitta bosishda xarid qilish
                </button>
              </div>
            </div>

            {/* Related products */}
            {related.length > 0 && (
              <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
                  O'xshash gadjetlar:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                  {related.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel.slug)}
                      className="glass-card"
                      style={{ padding: 12, cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        <img 
                          src={rel.image} 
                          alt={rel.name} 
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rel.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                        {formatPrice(rel.current_price || rel.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
