import React from 'react';
import { Sparkles, Shield, Cpu, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const HeroBanner = ({ onExploreDiscount, onExploreCategory }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div style={{ maxWidth: 1320, margin: '24px auto', padding: '0 20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          borderRadius: 'var(--radius-xl)', 
          padding: '40px 48px',
          background: isLight 
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #eef2ff 100%)' 
            : 'linear-gradient(135deg, rgba(24, 33, 58, 0.9) 0%, rgba(15, 23, 42, 0.95) 60%, rgba(30, 27, 75, 0.85) 100%)',
          border: isLight ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: isLight 
            ? '0 20px 45px rgba(99, 102, 241, 0.08), 0 4px 15px rgba(0,0,0,0.03)' 
            : '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(99, 102, 241, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 32,
          alignItems: 'center'
        }}
      >
        {/* Ambient Light Orbs */}
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: isLight 
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -80,
          left: 100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: isLight 
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Left Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '6px 14px', 
            background: isLight ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.18)', 
            border: isLight ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid rgba(99, 102, 241, 0.4)', 
            borderRadius: 'var(--radius-full)', 
            marginBottom: 18 
          }}>
            <Sparkles size={16} color={isLight ? '#4f46e5' : '#818cf8'} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isLight ? '#4f46e5' : '#818cf8', letterSpacing: '0.5px' }}>
              YANGI AVLOD GADJETLARI 2026
            </span>
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '2.8rem', 
            fontWeight: 800, 
            lineHeight: 1.15, 
            letterSpacing: '-1px', 
            marginBottom: 16,
            color: isLight ? '#0f172a' : '#ffffff'
          }}>
            Texnologik Cheksizlikni <br />
            <span style={{ 
              background: isLight 
                ? 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #0284c7 100%)' 
                : 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              Yosh Kuch Market
            </span> Bilan Kashf Eting
          </h1>

          <p style={{ color: isLight ? '#475569' : 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 540, marginBottom: 28 }}>
            Eng yangi iPhone 15 Pro, kuchli MacBook M3 va eng so'nggi audio tizimlar rasmiy kafolat bilan, qulay to'lov va tezkor yetkazib berish xizmati bilan!
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
            <button 
              onClick={onExploreDiscount}
              className="btn btn-primary" 
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            >
              <Flame size={18} />
              Katta Chegirmalar
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onExploreCategory('smartfonlar')}
              className="btn btn-secondary" 
              style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            >
              Smartfonlar Katalogi
            </button>
          </div>

          {/* Highlights checklist */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 24, 
            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)', 
            paddingTop: 20 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: isLight ? '#334155' : 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="var(--accent-success)" />
              <span>100% Original mahsulotlar</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: isLight ? '#334155' : 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="var(--accent-secondary)" />
              <span>Click, Payme, Uzum to'lovlari</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: isLight ? '#334155' : 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="var(--accent-warning)" />
              <span>12 oygacha foizsiz muddatli to'lov</span>
            </div>
          </div>
        </div>

        {/* Right Floating Visual Card */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 380,
              background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.85)',
              border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: isLight 
                ? '0 12px 35px rgba(0, 0, 0, 0.08)' 
                : 'var(--shadow-lg), 0 0 40px rgba(99, 102, 241, 0.25)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="badge badge-discount">Kunning maxsus taklifi</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600 }}>Omborda bor</span>
            </div>

            <div style={{ 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden', 
              background: isLight 
                ? 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, #f8fafc 100%)' 
                : 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0.9) 100%)',
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: 16
            }}>
              <img 
                src="/media/products/iphone-15-pro-max-256gb_ZSLB2d3.jpg" 
                alt="iPhone 15 Pro Max"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500';
                }}
                style={{ 
                  maxHeight: '85%', 
                  maxWidth: '85%', 
                  objectFit: 'contain', 
                  filter: isLight 
                    ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' 
                    : 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))',
                  transition: 'transform 0.4s ease'
                }} 
              />
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff', marginBottom: 4 }}>
              iPhone 15 Pro Max 256GB
            </div>
            <div style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : 'var(--text-dim)', marginBottom: 12 }}>
              A17 Pro chip • Titan korpus • 48MP kamera
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              paddingTop: 10, 
              borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.06)' 
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: isLight ? '#94a3b8' : 'var(--text-dim)', textDecoration: 'line-through' }}>
                  18 500 000 so'm
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isLight ? '#4f46e5' : '#38bdf8' }}>
                  16 990 000 so'm
                </div>
              </div>
              <span style={{ 
                padding: '4px 10px', 
                background: isLight ? 'rgba(99, 102, 241, 0.1)' : 'rgba(56, 189, 248, 0.15)', 
                color: isLight ? '#4f46e5' : '#38bdf8', 
                borderRadius: 8, 
                fontSize: '0.8rem', 
                fontWeight: 700 
              }}>
                -8% Chegirma
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
