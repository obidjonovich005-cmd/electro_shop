import React from 'react';
import { Filter, RotateCcw, Check, ArrowUpDown } from 'lucide-react';
import { formatPrice } from '../services/api';

const FilterSidebar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  brands = [],
  selectedBrands = [],
  onToggleBrand,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStockOnly,
  onToggleInStock,
  discountOnly,
  onToggleDiscount,
  sort,
  onSortChange,
  onResetFilters,
  totalResults = 0
}) => {
  return (
    <aside style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
          <Filter size={18} color="var(--accent-primary)" />
          <span>Filtrlar</span>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 10 }}>
            {totalResults} ta
          </span>
        </div>
        <button
          onClick={onResetFilters}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer'
          }}
          title="Barcha filtrlarni tozalash"
        >
          <RotateCcw size={13} /> Tozalash
        </button>
      </div>

      {/* Sorting Dropdown */}
      <div>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowUpDown size={14} /> Saralash
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="form-input"
          style={{ cursor: 'pointer', padding: '10px 14px' }}
        >
          <option value="newest">✨ Eng yangi qo'shilganlar</option>
          <option value="popular">🔥 Eng ommabop (Reyting)</option>
          <option value="price_asc">📉 Narx: Arzondan qimmatga</option>
          <option value="price_desc">📈 Narx: Qimmatdan arzonga</option>
          <option value="name_asc">🔤 Nomi bo'yicha (A-Z)</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
          Kategoriyalar
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: selectedCategory === null ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: selectedCategory === null ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: selectedCategory === null ? 700 : 500,
              fontSize: '0.86rem',
              textAlign: 'left'
            }}
          >
            <span>Barchasi</span>
            {selectedCategory === null && <Check size={14} color="#818cf8" />}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.86rem',
                  textAlign: 'left'
                }}
              >
                <span>{cat.name}</span>
                {isSelected && <Check size={14} color="#818cf8" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands Multi-select */}
      {brands.length > 0 && (
        <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
            Brendlar
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
            {brands.map((brand) => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: '0.86rem',
                    color: isChecked ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: 6,
                    background: isChecked ? 'rgba(255,255,255,0.04)' : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleBrand(brand)}
                    style={{ accentColor: 'var(--accent-primary)', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
          Narx oralig'i (so'm)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Dan:</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="form-input"
              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Gacha:</span>
            <input
              type="number"
              placeholder="50 000 000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="form-input"
              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.86rem' }}>
          <span>Faqat ombordagilar</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            style={{ accentColor: 'var(--accent-primary)', width: 18, height: 18, cursor: 'pointer' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.86rem' }}>
          <span>Faqat chegirmadagilar 🔥</span>
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={onToggleDiscount}
            style={{ accentColor: 'var(--accent-primary)', width: 18, height: 18, cursor: 'pointer' }}
          />
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
