import React, { useState } from 'react';
import { 
  Zap, Search, ShoppingBag, Heart, User, LogOut, 
  Menu, X, Sparkles, ShieldCheck, Truck, PhoneCall,
  Sun, Moon
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../services/api';

const Navbar = ({ 
  categories = [], 
  selectedCategory, 
  onSelectCategory, 
  searchQuery, 
  onSearchChange,
  onOpenProfile
}) => {
  const { cartCount, cartTotal, openCart, wishlist, openWishlist } = useCart();
  const { user, isAuthenticated, openAuth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Top micro bar */}
      <div className="navbar-topbar" style={{ 
        background: 'rgba(99, 102, 241, 0.08)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.8rem',
        padding: '6px 20px'
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={14} style={{ color: 'var(--accent-secondary)' }} />
              O'zbekiston bo'ylab 24 soatda bepul yetkazib berish
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-success)' }} />
              100% Rasmiy kafolat
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)' }}>
            <a href="tel:+998901234567" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'inherit', textDecoration: 'none' }}>
              <PhoneCall size={13} />
              +998 (90) 123-45-67
            </a>
            <span>UZ / SO'M</span>
          </div>
        </div>
      </div>

      {/* Main header row */}
      <div className="navbar-main-row" style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectCategory(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textDecoration: 'none' }}
        >
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--accent-gradient)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
          }}>
            <Zap size={26} color="#ffffff" fill="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.45rem', 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: theme === 'light'
                ? 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #6366f1 100%)'
                : 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              Yosh Kuch
              <span style={{ 
                fontSize: '0.65rem', 
                padding: '2px 7px', 
                background: theme === 'light' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.25)', 
                color: theme === 'light' ? '#4f46e5' : '#a5b4fc', 
                borderRadius: 6, 
                fontWeight: 800 
              }}>MARKET</span>
            </div>
            <div style={{ 
              fontSize: '0.72rem', 
              color: theme === 'light' ? '#64748b' : 'var(--text-dim)', 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              Kelajak Texnologiyalari
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="navbar-search-box" style={{ flex: 1, maxWidth: 580, position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: theme === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.9)',
            border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 6px 4px 18px',
            boxShadow: theme === 'light' ? '0 2px 10px rgba(0,0,0,0.05)' : 'inset 0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
          }}>
            <Search size={19} color="var(--accent-primary)" style={{ marginRight: 10, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Mahsulot nomi, brend (iPhone, MacBook, ASUS) yoki xususiyatlarini qidiring..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: theme === 'light' ? '#0f172a' : '#ffffff',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-main)',
                fontWeight: 500
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0 8px' }}
              >
                <X size={16} />
              </button>
            )}
            <button 
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-full)', padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Qidirish
            </button>
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === 'light' ? "Tungi rejimga o'tish" : "Yorug' rejimga o'tish"}
            style={{
              background: theme === 'light' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: theme === 'light' ? '#f59e0b' : '#38bdf8',
              border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s',
            }}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          {/* Wishlist badge */}
          <button 
            onClick={openWishlist}
            className="btn-icon"
            title="Sevimlilar"
            style={{ position: 'relative' }}
          >
            <Heart size={20} color={wishlist.length ? '#f43f5e' : 'var(--text-main)'} fill={wishlist.length ? '#f43f5e' : 'none'} />
            {wishlist.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#f43f5e',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)'
              }}>
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart button */}
          <button 
            onClick={openCart}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              position: 'relative',
              gap: 10
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0f172a'
                }}>
                  {cartCount}
                </span>
              )}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Savat</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                {cartCount > 0 ? formatPrice(cartTotal) : "Bo'sh"}
              </div>
            </div>
          </button>

          {/* User profile / login */}
          <div style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="btn btn-secondary"
                  style={{ borderRadius: 'var(--radius-full)', padding: '8px 14px', gap: 8 }}
                >
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.88rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.first_name || user.username}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: 220,
                    background: '#0f172a',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 8,
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100
                  }}>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '10px 12px' }}
                    >
                      <User size={16} /> Mening profilim / Buyurtmalar
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '10px 12px', color: '#f87171' }}
                    >
                      <LogOut size={16} /> Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="btn btn-secondary"
                style={{ borderRadius: 'var(--radius-full)', padding: '10px 16px', gap: 8 }}
              >
                <User size={18} />
                <span>Kirish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ 
        borderTop: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
        background: theme === 'light' ? '#f8fafc' : 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '10px 20px',
        overflowX: 'auto',
        boxShadow: theme === 'light' ? 'inset 0 1px 3px rgba(0,0,0,0.02)' : 'none'
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: selectedCategory === null 
                ? '1px solid var(--accent-primary)' 
                : theme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.14)',
              background: selectedCategory === null 
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                : theme === 'light' ? '#ffffff' : 'rgba(30, 41, 59, 0.75)',
              color: selectedCategory === null 
                ? '#ffffff' 
                : theme === 'light' ? '#0f172a' : '#f1f5f9',
              fontWeight: selectedCategory === null ? 700 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedCategory === null 
                ? '0 4px 14px rgba(99, 102, 241, 0.35)' 
                : theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🔥 Barcha Mahsulotlar</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected 
                    ? '1px solid var(--accent-primary)' 
                    : theme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.14)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                    : theme === 'light' ? '#ffffff' : 'rgba(30, 41, 59, 0.75)',
                  color: isSelected 
                    ? '#ffffff' 
                    : theme === 'light' ? '#0f172a' : '#f1f5f9',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected 
                    ? '0 4px 14px rgba(99, 102, 241, 0.35)' 
                    : theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>{cat.name}</span>
                {cat.products_count !== undefined && (
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700,
                    background: isSelected 
                      ? 'rgba(255,255,255,0.25)' 
                      : theme === 'light' ? '#eef2ff' : 'rgba(255,255,255,0.14)',
                    color: isSelected 
                      ? '#ffffff' 
                      : theme === 'light' ? '#4f46e5' : '#93c5fd',
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-full)' 
                  }}>
                    {cat.products_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
