import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import FilterSidebar from './components/FilterSidebar';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import SeasonEffects from './components/SeasonEffects';
import ProductCardSkeleton from './components/ProductCardSkeleton';
import { fetchProducts, fetchStoreMeta } from './services/api';
import { Sparkles, Zap, Shield, Truck, RefreshCw, Phone, Mail, MapPin, ChevronDown } from 'lucide-react';

function App() {
  // Store metadata
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals & Navigation
  const [detailSlug, setDetailSlug] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutInstallmentPlan, setCheckoutInstallmentPlan] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load store metadata once
  useEffect(() => {
    fetchStoreMeta()
      .then((meta) => {
        setCategories(meta.categories || []);
        setBrands(meta.brands || []);
      })
      .catch((err) => console.error('Error fetching meta:', err));
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStockOnly) params.in_stock = '1';
    if (discountOnly) params.discount = '1';
    if (sort) params.sort = sort;

    fetchProducts(params)
      .then((data) => {
        setProducts(data || []);
        setVisibleCount(8);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [selectedCategory, selectedBrands, searchQuery, minPrice, maxPrice, inStockOnly, discountOnly, sort]);

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setDiscountOnly(false);
    setSort('newest');
    setVisibleCount(8);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Hero Banner (visible on full catalog view) */}
      {!selectedCategory && !searchQuery && (
        <HeroBanner
          onExploreDiscount={() => setDiscountOnly(true)}
          onExploreCategory={(slug) => setSelectedCategory(slug)}
        />
      )}

      {/* Main Catalog Section */}
      <main style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {/* Category / Search heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              {searchQuery
                ? `Qidiruv natijalari: "${searchQuery}"`
                : selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Katalog'
                : 'Barcha Mashhur Mahsulotlar'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {loading ? "Yuklanmoqda..." : `${products.length} ta mahsulot topildi`}
            </p>
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="mobile-filter-toggle-row">
          <button 
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="btn btn-secondary mobile-filter-btn"
          >
            <span>🎛️ {showMobileFilters ? "Filtrlarni yashirish" : "Filtrlarni ko'rsatish"}</span>
            <span className="badge badge-stock">{products.length} ta</span>
          </button>
        </div>

        {/* Catalog 2-column layout */}
        <div className="catalog-layout">
          {/* Left Column: Filter Sidebar */}
          <div className={`glass-card filter-sidebar-card ${showMobileFilters ? 'mobile-filters-open' : 'mobile-filters-closed'}`}>
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              brands={brands}
              selectedBrands={selectedBrands}
              onToggleBrand={handleToggleBrand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly((v) => !v)}
              discountOnly={discountOnly}
              onToggleDiscount={() => setDiscountOnly((v) => !v)}
              sort={sort}
              onSortChange={setSort}
              onResetFilters={handleResetFilters}
              totalResults={products.length}
            />
          </div>

          {/* Right Column: Product Cards Grid */}
          <div>
            {loading ? (
              <div className="products-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <ProductCardSkeleton key={n} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div 
                className="glass-card" 
                style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                  Hech qanday mahsulot topilmadi
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', maxWidth: 360, margin: '0 auto 20px' }}>
                  Kiritilgan parametrlar bo'yicha mahsulotlar mavjud emas. Filtrlarni tozalab qayta urinib ko'ring.
                </p>
                <button onClick={handleResetFilters} className="btn btn-primary">
                  Filtrlarni tozalash
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.slice(0, visibleCount).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={() => setDetailSlug(product.slug)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {products.length > visibleCount && (
                  <div style={{ textAlign: 'center', marginTop: 36 }}>
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="btn btn-secondary"
                      style={{
                        padding: '12px 28px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <ChevronDown size={18} /> Yana ko'proq yuklash ({Math.min(visibleCount, products.length)} / {products.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 60,
        background: 'rgba(9, 13, 22, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '48px 20px 24px'
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, marginBottom: 40 }}>
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} color="#fff" />
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  Yosh Kuch Market
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16 }}>
                Eng yangi elektronika gadjetlari, smartfonlar va maishiy texnikalar rasmiy kafolati bilan O'zbekistondagi yetakchi do'kon.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Click', 'Payme', 'Uzum', 'Visa', 'Mastercard'].map((p) => (
                  <span key={p} style={{ fontSize: '0.72rem', padding: '4px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, color: '#94a3b8', fontWeight: 600 }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
                Kategoriyalar
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button 
                      onClick={() => setSelectedCategory(c.slug)}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
                Mijozlarga yordam
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>Yetkazib berish va to'lov shartlari</li>
                <li>Kafolat va servis xizmati</li>
                <li>Bo'lib to'lash (Nasiya) tartibi</li>
                <li>Maxfiylik siyosati</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
                Bog'lanish
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={15} color="var(--accent-secondary)" />
                  <span>+998 (90) 123-45-67</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={15} color="var(--accent-primary)" />
                  <span>support@yoshkuch.uz</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={15} color="var(--accent-success)" />
                  <span>Toshkent sh., Amir Temur shoh ko'chasi, 42</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>© 2026 Yosh Kuch Market. Barcha huquqlar himoyalangan.</div>
            <div>Designed & Developed with Django REST + Modern React</div>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      {detailSlug && (
        <ProductDetailModal
          productSlug={detailSlug}
          onClose={() => setDetailSlug(null)}
          onSelectRelated={(slug) => setDetailSlug(slug)}
          onProceedInstallment={(plan) => {
            setCheckoutInstallmentPlan(plan);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      <CartDrawer
        onProceedCheckout={() => {
          setCheckoutInstallmentPlan(null);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistDrawer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutInstallmentPlan(null);
        }}
        initialInstallmentPlan={checkoutInstallmentPlan}
        onOrderSuccess={() => {}}
      />

      <AuthModal />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Fasllar (kuzgi xazon va qishki qor) effekti */}
      <SeasonEffects />
    </div>
  );
}

export default App;
