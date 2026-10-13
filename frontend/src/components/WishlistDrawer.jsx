import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';
import { useState } from 'react';
import { getProductImage } from '../utils/productImages';

const WishlistItem = ({ product, onAddToCart, onRemove }) => {
  const [added, setAdded] = useState(false);
  const currentPrice = product.current_price || product.discount_price || product.price;
  const discountPercent = product.discount_percent ||
    (product.discount_price && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 14px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color 0.2s',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 68,
        height: 68,
        borderRadius: 'var(--radius-sm)',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, #090d16 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 6,
        position: 'relative',
      }}>
        <img
          src={getProductImage(product)}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = getProductImage(product); }}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
        {discountPercent > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: 'var(--accent-danger, #ef4444)',
            color: '#fff', fontSize: '0.6rem', fontWeight: 800,
            padding: '1px 4px', borderRadius: 4,
          }}>
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>
          {product.brand || 'Original'}
        </div>
        <h4 style={{
          fontSize: '0.88rem', fontWeight: 600, color: '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4,
        }}>
          {product.name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
            {formatPrice(currentPrice)}
          </span>
          {discountPercent > 0 && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 10px',
            background: added ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
            border: `1px solid ${added ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}`,
            borderRadius: 'var(--radius-sm)',
            color: added ? '#34d399' : '#818cf8',
            fontSize: '0.78rem', fontWeight: 700,
            cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
            opacity: product.stock <= 0 ? 0.5 : 1,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          title="Savatga qo'shish"
        >
          {added ? <><Check size={13} /> Qo'shildi</> : <><ShoppingBag size={13} /> Savat</>}
        </button>
        <button
          onClick={() => onRemove(product.id)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '5px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Sevimlilardan o'chirish"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const WishlistDrawer = ({ onOpenDetail }) => {
  const { wishlistItems, toggleWishlist, isWishlistOpen, closeWishlist, addToCart, openCart } = useCart();

  if (!isWishlistOpen) return null;

  const totalSavings = wishlistItems.reduce((acc, p) => {
    if (p.discount_price && p.discount_price < p.price) {
      return acc + (Number(p.price) - Number(p.discount_price));
    }
    return acc;
  }, 0);

  const handleAddAll = () => {
    wishlistItems.forEach((p) => {
      if (p.stock > 0) addToCart(p, 1);
    });
    closeWishlist();
    openCart();
  };

  return (
    <div className="modal-backdrop" onClick={closeWishlist} style={{ zIndex: 1025 }}>
      <div
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{ right: 0, left: 'auto' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, rgba(244,63,94,0.3) 0%, rgba(239,68,68,0.15) 100%)',
              border: '1px solid rgba(244,63,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={18} color="#f43f5e" fill="#f43f5e" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Sevimlilar</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {wishlistItems.length} ta mahsulot saqlangan
              </span>
            </div>
          </div>
          <button
            onClick={closeWishlist}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              borderRadius: '50%', width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Savings banner */}
        {totalSavings > 0 && (
          <div style={{
            padding: '10px 24px',
            background: 'linear-gradient(90deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.08) 100%)',
            borderBottom: '1px solid rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem',
          }}>
            <Sparkles size={15} color="#34d399" />
            <span style={{ color: 'var(--text-muted)' }}>
              Sevimlilardagi chegirmalar bilan{' '}
              <strong style={{ color: '#34d399' }}>{formatPrice(totalSavings)}</strong>{' '}
              tejaladi
            </span>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--text-muted)' }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <Heart size={34} color="rgba(244,63,94,0.4)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Sevimlilar bo'sh
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: 270, margin: '0 auto 20px' }}>
                Yoqqan mahsulotlar yonidagi ♡ belgisini bosing — ular shu yerda saqlanadi
              </p>
              <button onClick={closeWishlist} className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
                Katalogga qaytish
              </button>
            </div>
          ) : (
            wishlistItems.map((product) => (
              <WishlistItem
                key={product.id}
                product={product}
                onAddToCart={(p) => addToCart(p, 1)}
                onRemove={(id) => toggleWishlist(id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(9, 13, 22, 0.75)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Umumiy qiymat:
              </span>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                {formatPrice(wishlistItems.reduce((acc, p) => acc + Number(p.current_price || p.price), 0))}
              </span>
            </div>
            <button
              onClick={handleAddAll}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', gap: 10 }}
            >
              <ShoppingBag size={18} />
              Barchasini savatga qo'shish
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDrawer;
