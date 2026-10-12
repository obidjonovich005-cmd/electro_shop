import React, { useEffect, useRef, useState } from 'react';
import { Snowflake, Wind, EyeOff } from 'lucide-react';

export default function SeasonEffects() {
  // Avtomatik joriy oyni aniqlash:
  // 9, 10, 11 - Kuz (autumn)
  // 12, 1, 2 - Qish (winter)
  const getDefaultSeason = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 9 && month <= 11) return 'autumn';
    if (month === 12 || month === 1 || month === 2) return 'winter';
    return 'autumn'; // bahor/yozda ham kuz/qor sinab ko'rish mumkin
  };

  const [season, setSeason] = useState(() => {
    return localStorage.getItem('electro_season') || getDefaultSeason();
  });
  const [panelOpen, setPanelOpen] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('electro_season', season);
  }, [season]);

  useEffect(() => {
    if (season === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Zarrachalar soni va sozlamalari
    const count = season === 'winter' ? 80 : 32;
    const particles = [];

    // Ranglar palitrasi (barglar uchun)
    const leafColors = [
      '#eab308', // oltin sariq
      '#f97316', // olovrang to'q sariq
      '#ef4444', // qizil
      '#d97706', // tilla jigarrang
      '#b45309', // xazon
    ];

    for (let i = 0; i < count; i++) {
      // 0: 6 qirrali muz kristali, 1: 4 qirrali olmos muz yulduzi, 2: mayda muz donasi
      const crystalType = i % 3;
      let radius;
      if (season === 'winter') {
        if (crystalType === 0) radius = Math.random() * 7 + 8; // 8 - 15px
        else if (crystalType === 1) radius = Math.random() * 4 + 5; // 5 - 9px
        else radius = Math.random() * 2 + 2; // 2 - 4px
      } else {
        radius = Math.random() * 8 + 8;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        speedY: season === 'winter' ? Math.random() * 1.3 + 0.7 : Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 1.0 - 0.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.025 + 0.012,
        angle: Math.random() * 360,
        spinSpeed: (Math.random() - 0.5) * 1.8,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        // Muzdek tiniq, nafis shaffoflik va yaltiroqlik (0.65 dan 0.95 gacha)
        opacity: season === 'winter' ? Math.random() * 0.3 + 0.65 : Math.random() * 0.6 + 0.35,
        crystalType,
      });
    }

    // Barg chizish
    const drawLeaf = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      // Chinor barg shakli
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius, p.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tomir
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-p.radius * 0.8, 0);
      ctx.lineTo(p.radius * 0.8, 0);
      ctx.stroke();

      ctx.restore();
    };

    // Haqiqiy muz kristali rangidagi (Ice Crystal) tiniq va o'tkir qor parchalari
    const drawSnow = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.opacity;

      const r = p.radius;

      if (p.crystalType === 0) {
        // 1-TUR: 6 qirrali nafis muz kristali (Ice Crystal Snowflake) ❄️
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.strokeStyle = '#ffffff'; // Toza muz kristal oq rangi
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(224, 242, 254, 0.85)'; // Muzdek och kristall jilva

        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, r);
          // Yon shoxchalar (muz qirralari)
          ctx.moveTo(0, r * 0.55);
          ctx.lineTo(-r * 0.28, r * 0.78);
          ctx.moveTo(0, r * 0.55);
          ctx.lineTo(r * 0.28, r * 0.78);
          // Kichik qo'shimcha qirra
          ctx.moveTo(0, r * 0.32);
          ctx.lineTo(-r * 0.16, r * 0.46);
          ctx.moveTo(0, r * 0.32);
          ctx.lineTo(r * 0.16, r * 0.46);
          ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }

        // Markaziy muz kristali yadrosi
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.crystalType === 1) {
        // 2-TUR: 4 qirrali yarqiragan olmos muz kristali (Diamond Ice Star) ✨
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(224, 242, 254, 0.9)';

        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.closePath();
        ctx.fill();

        // Nozik muz qatlami
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 3-TUR: Tiniq muz donasi / qirov (Frost pellet)
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(224, 242, 254, 0.8)';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.8;
        p.y += p.speedY;
        p.angle += p.spinSpeed;

        if (season === 'winter') {
          drawSnow(p);
        } else {
          drawLeaf(p);
        }

        // Chegaradan chiqqanda qaytarish
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [season]);

  return (
    <>
      {/* 1. Shaffof Canvas (faqat vizual, bosishlarga ta'sir qilmaydi) */}
      {season !== 'none' && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 999,
          }}
        />
      )}

      {/* 2. O'ng pastki burchakdagi Fasl tanlash boshqaruvi */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1010,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {panelOpen && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '4px 8px', fontWeight: 600 }}>
              Fasl atmosferasi:
            </div>
            <button
              onClick={() => { setSeason('autumn'); setPanelOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: '10px', border: 'none',
                background: season === 'autumn' ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                color: season === 'autumn' ? '#facc15' : '#e2e8f0',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <Wind size={15} color="#eab308" /> 🍂 Kuz (Xazonrezgi)
            </button>
            <button
              onClick={() => { setSeason('winter'); setPanelOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: '10px', border: 'none',
                background: season === 'winter' ? 'rgba(224, 242, 254, 0.2)' : 'transparent',
                color: season === 'winter' ? '#bae6fd' : '#e2e8f0',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <Snowflake size={15} color="#bae6fd" /> ❄️ Qish (Muz kristallari)
            </button>
            <button
              onClick={() => { setSeason('none'); setPanelOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: '10px', border: 'none',
                background: season === 'none' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: season === 'none' ? '#f87171' : '#94a3b8',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <EyeOff size={15} /> ✖️ Effektni o'chirish
            </button>
          </div>
        )}

        {/* Asosiy kichkina tugmacha */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          title="Fasl effektini o'zgartirish"
          style={{
            background: season === 'winter'
              ? 'linear-gradient(135deg, rgba(224, 242, 254, 0.28) 0%, rgba(125, 211, 252, 0.35) 100%)'
              : season === 'autumn'
              ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(249, 115, 22, 0.4) 100%)'
              : 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            padding: '8px 14px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
          }}
        >
          {season === 'winter' && <>❄️ Qish rejimi</>}
          {season === 'autumn' && <>🍂 Kuz rejimi</>}
          {season === 'none' && <>✨ Fasllar</>}
        </button>
      </div>
    </>
  );
}
