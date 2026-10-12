import React, { useState, useEffect } from 'react';
import { X, User, Package, Save, LogOut, Loader2, CheckCircle2, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserOrders, updateUserProfile, formatPrice } from '../services/api';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setSaveMsg('');
      setSaveError('');
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      setOrdersLoading(true);
      fetchUserOrders()
        .then((res) => {
          setOrders(res || []);
          setOrdersLoading(false);
        })
        .catch(() => setOrdersLoading(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      const data = await updateUserProfile({ first_name: firstName, last_name: lastName, phone, email, address });
      setUser(data.user);
      setSaveMsg('Profil muvaffaqiyatli saqlandi!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const statusLabel = (status) => {
    const map = { new: 'Yangi', confirmed: 'Tasdiqlangan', delivered: 'Yetkazildi', canceled: 'Bekor qilingan' };
    return map[status] || status;
  };

  const statusClass = (status) => {
    if (status === 'delivered' || status === 'confirmed') return 'badge badge-stock';
    if (status === 'canceled') return 'badge badge-discount';
    return 'badge badge-new';
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1040 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700, padding: 0, position: 'relative', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '24px 28px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                {user?.first_name || user?.username} {user?.last_name || ''}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                @{user?.username}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-md)', padding: '7px 14px',
                color: '#f87171', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <LogOut size={15} /> Chiqish
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px' }}>
          {[
            { id: 'profile', label: 'Profil', icon: <User size={15} /> },
            { id: 'orders', label: `Buyurtmalar`, icon: <Package size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 0', marginRight: 24,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 700,
                color: activeTab === tab.id ? '#fff' : 'var(--text-dim)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px', maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 5, display: 'block', fontWeight: 600 }}>Ism</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sardor"
                    className="form-input"
                    style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 5, display: 'block', fontWeight: 600 }}>Familiya</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Aliyev"
                    className="form-input"
                    style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 5, display: 'block', fontWeight: 600 }}>
                  <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="form-input"
                  style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 5, display: 'block', fontWeight: 600 }}>
                  <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="form-input"
                  style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 5, display: 'block', fontWeight: 600 }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Yetkazib berish manzili
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shahar, ko'cha, uy raqami..."
                  className="form-input"
                  rows={2}
                  style={{ padding: '10px 12px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              {saveError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem' }}>
                  {saveError}
                </div>
              )}

              {saveMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> {saveMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: 4 }}
              >
                {saving ? <><Loader2 size={17} className="animate-spin" /> Saqlanmoqda...</> : <><Save size={17} /> Profilni saqlash</>}
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div>
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                  Yuklanmoqda...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', color: 'var(--text-dim)' }}>
                  <Package size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                  <div style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>Buyurtmalar yo'q</div>
                  <div style={{ fontSize: '0.85rem' }}>Hali hech qanday buyurtma berilmagan.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        padding: 16,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                            Buyurtma #{ord.id}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                            {new Date(ord.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <span className={statusClass(ord.status)} style={{ fontSize: '0.72rem' }}>
                          {statusLabel(ord.status)}
                        </span>
                      </div>

                      {/* Items */}
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {ord.items?.slice(0, 3).map((itm) => (
                          <div key={itm.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                              {itm.product?.name} <span style={{ color: 'var(--text-dim)' }}>x{itm.quantity}</span>
                            </span>
                            <span style={{ fontWeight: 600 }}>{formatPrice(itm.price)}</span>
                          </div>
                        ))}
                        {ord.items?.length > 3 && (
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                            + yana {ord.items.length - 3} ta tovar
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          {ord.payment_method_display || ord.payment_method} — {ord.payment_status_display || ord.payment_status}
                        </span>
                        <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                          {formatPrice(ord.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
