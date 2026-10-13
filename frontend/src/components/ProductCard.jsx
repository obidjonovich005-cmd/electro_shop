import React, { useState } from 'react';
import { ShoppingBag, Heart, Star, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';

import { getProductImage } from '../utils/productImages';

const ProductCard = ({ product, onOpenDetail }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id, product);
  };

  const discountPercent = product.discount_percent || 
    (product.discount_price && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0);

  const currentPrice = product.current_price || (product.discount_price || product.price);
  const imageUrl = getProductImage(product);

  return (
    <div 
      className="glass-card"
      onClick={() => onOpenDetail(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Top badges & Wishlist */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {discountPercent > 0 && (
            <span className="badge badge-discount">
              -{discountPercent}%
            </span>
          )}
          {product.stock > 0 ? (
            <span className="badge badge-stock" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              Mavjud
            </span>
          ) : (
            <span className="badge badge-out" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              Tugagan
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          style={{
            background: wishlisted ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid ' + (wishlisted ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'),
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          title={wishlisted ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
        >
          <Heart 
            size={18} 
            color={wishlisted ? '#f43f5e' : 'var(--text-muted)'} 
            fill={wishlisted ? '#f43f5e' : 'none'} 
          />
        </button>
      </div>

      {/* Product Image */}
      <div style={{
        height: 190,
        borderRadius: 'var(--radius-md)',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(15, 23, 42, 0.6) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 16,
        padding: 10,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = imageUrl;
          }}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
          }}
          className="hover:scale-105"
        />
      </div>

      {/* Brand & Category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {product.brand || 'Original'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#fbbf24' }}>
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span style={{ fontWeight: 700 }}>{product.rating || '4.9'}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>({product.reviews_count || '12'})</span>
        </div>
      </div>

      {/* Product Title */}
      <h3 style={{
        fontSize: '0.98rem',
        fontWeight: 600,
        color: 'var(--text-main)',
        marginBottom: 8,
        lineHeight: 1.35,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.7em',
        wordBreak: 'break-word',
        minWidth: 0
      }}>
        {product.name}
      </h3>

      {/* Specs brief */}
      {product.specs && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          marginBottom: 14,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          maxWidth: '100%'
        }}>
          {product.specs}
        </div>
      )}

      {/* Price & Add to Cart button */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 12,
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
        minWidth: 0
      }}>
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          {discountPercent > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </div>
          )}
          <div style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
            {formatPrice(currentPrice)}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`btn ${added ? 'btn-cyan' : 'btn-primary'}`}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            opacity: product.stock <= 0 ? 0.5 : 1,
            cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
            flexShrink: 0
          }}
          title="Savatga qo'shish"
        >
          {added ? (
            <>
              <Check size={15} /> Qo'shildi
            </>
          ) : (
            <>
              <ShoppingBag size={15} /> Savat
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
