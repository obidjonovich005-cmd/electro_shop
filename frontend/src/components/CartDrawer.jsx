import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';

const CartDrawer = ({ onProceedCheckout }) => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_LIMIT = 2000000; // 2 million so'm
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_LIMIT) * 100));

  return (
    <div className="modal-backdrop" onClick={closeCart} style={{ zIndex: 1020 }}>
      <div 
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Savatcha</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{cartCount} ta mahsulot tanlangan</span>
            </div>
          </div>

          <button
            onClick={closeCart}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div style={{ padding: '12px 24px', background: 'rgba(99, 102, 241, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
              <Truck size={14} color="var(--accent-secondary)" />
              {progressPercent >= 100 ? (
                <strong style={{ color: 'var(--accent-success)' }}>Siz uchun yetkazib berish BEPUL! 🚀</strong>
              ) : (
                <span>Bepul yetkazish uchun yana <strong>{formatPrice(FREE_SHIPPING_LIMIT - cartTotal)}</strong> xarid qiling</span>
              )}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{progressPercent}%</span>
          </div>
          <div style={{ height: 6, width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: progressPercent >= 100 ? 'var(--accent-success)' : 'var(--accent-gradient)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--text-muted)' }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <ShoppingBag size={32} color="var(--text-dim)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Savatingiz hozircha bo'sh
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: 280, margin: '0 auto 20px' }}>
                Katalogdan o'zingizga yoqqan gadjetlarni tanlab savatchaga qo'shing
              </p>
              <button onClick={closeCart} className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
                Xaridni boshlash
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => {
              const itemTotal = (Number(product.current_price) || Number(product.price)) * quantity;
              return (
                <div 
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 12,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--radius-sm)',
                    background: '#090d16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: 4
                  }}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Title & Price */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: 4
                    }}>
                      {product.name}
                    </h4>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                      {formatPrice(itemTotal)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 4px'
                  }}>
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', padding: 4, cursor: 'pointer', display: 'flex' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, width: 24, textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', padding: 4, cursor: 'pointer', display: 'flex' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      padding: 6,
                      cursor: 'pointer',
                      display: 'flex'
                    }}
                    title="O'chirish"
                  >
                    <Trash2 size={16} color="#f87171" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(9, 13, 22, 0.75)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Yetkazib berish:</span>
              <span style={{ color: progressPercent >= 100 ? 'var(--accent-success)' : '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                {progressPercent >= 100 ? 'BEPUL' : '15 000 so\'m'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Jami to'lov:</span>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  {formatPrice(cartTotal + (progressPercent >= 100 ? 0 : 15000))}
                </div>
              </div>
              <button
                onClick={clearCart}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Savatni tozalash
              </button>
            </div>

            <button
              onClick={() => {
                closeCart();
                onProceedCheckout();
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                gap: 10
              }}
            >
              <span>Buyurtmani rasmiylashtirish</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
