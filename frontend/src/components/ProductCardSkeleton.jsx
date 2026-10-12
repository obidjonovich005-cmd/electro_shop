import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 16,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Image Skeleton */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          height: 200,
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
        }}
      />

      {/* Badges / Category Skeleton */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 20 }} />
        <div className="skeleton" style={{ width: 45, height: 18, borderRadius: 20 }} />
      </div>

      {/* Title Lines Skeleton */}
      <div className="skeleton" style={{ width: '85%', height: 16, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '55%', height: 16, marginBottom: 16 }} />

      {/* Rating & Stock Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 70, height: 14 }} />
        <div className="skeleton" style={{ width: 80, height: 14 }} />
      </div>

      {/* Price & Action Skeleton */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="skeleton" style={{ width: 90, height: 22, marginBottom: 4 }} />
          <div className="skeleton" style={{ width: 60, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}
