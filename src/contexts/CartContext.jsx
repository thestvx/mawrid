import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'mawrid_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildItem(product) {
  const price = Number(product.sale_price) > 0 ? Number(product.sale_price) : Number(product.price) || 0;
  return {
    id: String(product.id || product.key || ''),
    title_ar: product.name || product.title_ar || '',
    title_en: product.name_en || product.title_en || product.name || '',
    img: product.thumbnail || (Array.isArray(product.images) && product.images[0]) || product.icon || '',
    price,
    originalPrice: Number(product.price) || price,
    qty: 1,
    options: product.options || {},
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [lastAdded, setLastAdded] = useState(null);
  const { dir } = useLanguage();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / private mode */
    }
  }, [items]);

  const toast = useCallback((msgKey, opts = {}) => {
    setLastAdded({ key: msgKey, ts: Date.now(), ...opts });
    window.clearTimeout(toast._tid);
    toast._tid = window.setTimeout(() => setLastAdded(null), 2400);
  }, []);

  const add = useCallback(
    (product, options = {}) => {
      const item = buildItem(product);
      setItems((prev) => {
        const existing = prev.find((p) => p.id === item.id);
        if (existing) {
          return prev.map((p) =>
            p.id === item.id ? { ...p, qty: Math.min(99, p.qty + 1), options: { ...p.options, ...options } } : p
          );
        }
        return [...prev, { ...item, options: { ...item.options, ...options } }];
      });
      toast('cart.added', { title: item.title_ar || item.title_en });
    },
    [toast]
  );

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = Math.max(1, Math.min(99, Number(qty) || 1));
        return { ...p, qty: next };
      })
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal, tax, total, originalTotal } = useMemo(() => {
    const count = items.reduce((acc, p) => acc + p.qty, 0);
    const subtotal = items.reduce((acc, p) => acc + p.price * p.qty, 0);
    const originalTotal = items.reduce((acc, p) => acc + p.originalPrice * p.qty, 0);
    const tax = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + tax;
    return { count, subtotal, tax, total, originalTotal };
  }, [items]);

  const value = useMemo(
    () => ({ items, add, remove, updateQty, clear, count, subtotal, tax, total, originalTotal, lastAdded }),
    [items, add, remove, updateQty, clear, count, subtotal, tax, total, originalTotal, lastAdded]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
