// Aniq va chiroyli mahsulot rasmlari xaritasi (slug yoki nomga qarab)
const PRODUCT_IMAGE_MAP = {
  // Smartfonlar
  'iphone-15-pro-max-256gb': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
  'samsung-galaxy-s24-ultra-512gb': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
  'xiaomi-14-ultra-512gb': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',

  // Noutbuklar
  'macbook-air-15-m3-16gb-512gb': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  'asus-rog-zephyrus-g16-oled': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
  'lenovo-legion-pro-5-16': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',

  // Quloqchinlar va Audio
  'airpods-pro-2-usb-c': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
  'sony-wh-1000xm5-black': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  'marshall-major-iv-black': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',

  // Aqlli soatlar
  'apple-watch-series-9-45mm': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
  'samsung-galaxy-watch-6-classic-47mm': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
};

// Kategoriya bo'yicha zaxira rasmlar
const CATEGORY_FALLBACKS = {
  smartfonlar: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  noutbuklar: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  quloqchinlar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  'aqlli-soatlar': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
};

export const getProductImage = (product) => {
  if (!product) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';

  // 1. Agar slug xaritada aniq bo'lsa, 100% original rasm beramiz
  if (product.slug && PRODUCT_IMAGE_MAP[product.slug]) {
    return PRODUCT_IMAGE_MAP[product.slug];
  }

  // 2. Nomiga qarab tekshiramiz
  const name = (product.name || '').toLowerCase();
  if (name.includes('iphone')) return PRODUCT_IMAGE_MAP['iphone-15-pro-max-256gb'];
  if (name.includes('galaxy s') || name.includes('s24')) return PRODUCT_IMAGE_MAP['samsung-galaxy-s24-ultra-512gb'];
  if (name.includes('xiaomi')) return PRODUCT_IMAGE_MAP['xiaomi-14-ultra-512gb'];
  if (name.includes('macbook')) return PRODUCT_IMAGE_MAP['macbook-air-15-m3-16gb-512gb'];
  if (name.includes('zephyrus') || name.includes('rog')) return PRODUCT_IMAGE_MAP['asus-rog-zephyrus-g16-oled'];
  if (name.includes('legion') || name.includes('lenovo')) return PRODUCT_IMAGE_MAP['lenovo-legion-pro-5-16'];
  if (name.includes('airpods')) return PRODUCT_IMAGE_MAP['airpods-pro-2-usb-c'];
  if (name.includes('wh-1000xm5') || name.includes('sony')) return PRODUCT_IMAGE_MAP['sony-wh-1000xm5-black'];
  if (name.includes('marshall')) return PRODUCT_IMAGE_MAP['marshall-major-iv-black'];
  if (name.includes('apple watch')) return PRODUCT_IMAGE_MAP['apple-watch-series-9-45mm'];
  if (name.includes('galaxy watch')) return PRODUCT_IMAGE_MAP['samsung-galaxy-watch-6-classic-47mm'];

  // 3. Agar backenddan haqiqiy rasm kelgan bo'lsa
  if (product.image && typeof product.image === 'string' && !product.image.endsWith('.png') && !product.image.includes('placeholder')) {
    return product.image;
  }

  // 4. Kategoriya bo'yicha zaxira
  const catSlug = product.category_slug || (typeof product.category === 'object' ? product.category?.slug : product.category);
  if (catSlug && CATEGORY_FALLBACKS[catSlug]) {
    return CATEGORY_FALLBACKS[catSlug];
  }

  return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
};
