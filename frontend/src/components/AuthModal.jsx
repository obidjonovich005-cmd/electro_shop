import React, { useState } from 'react';
import { X, Lock, User, Phone, Mail, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { authModal, closeAuth, login, register } = useAuth();
  const [mode, setMode] = useState(authModal.mode || 'login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [email, setEmail] = useState('');

  if (!authModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register({
          username,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Xatolik yuz berdi. Ma'lumotlarni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuth} style={{ zIndex: 1040 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 32, position: 'relative' }}
      >
        <button
          onClick={closeAuth}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(255, 255, 255, 0.08)',
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
          <X size={16} />
        </button>

        {/* Header Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-dim)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: mode === 'login' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Kirish
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-dim)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: mode === 'register' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Ism *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sardor"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input"
                    style={{ padding: '10px 12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Familiya</label>
                  <input
                    type="text"
                    placeholder="Aliyev"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                    style={{ padding: '10px 12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Telefon raqam *</label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  style={{ padding: '10px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Email (ixtiyoriy)</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ padding: '10px 12px' }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
              {mode === 'login' ? 'Login yoki telefon raqam *' : 'Foydalanuvchi nomi (login) *'}
            </label>
            <input
              type="text"
              required
              placeholder={mode === 'login' ? 'Username yoki +998...' : 'yangi_login'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              style={{ padding: '10px 12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Parol *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ padding: '10px 12px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 10, fontSize: '0.95rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Kutilmoqda...
              </>
            ) : (
              mode === 'login' ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
