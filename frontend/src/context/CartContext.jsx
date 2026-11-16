import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { cartApi } from '../services/cart';
import { normalizeCart } from '../utils/product';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const SESSION_KEY = 'pretwear_cart_session_id';

function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const sessionId = !user ? getOrCreateSessionId() : null;

  const syncFrom = (cart) => {
    const n = normalizeCart(cart);
    setItems(n.items || []);
    setSubtotal(n.subtotal || 0);
    setCount(n.count || 0);
  };

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cartApi.get(!user ? getOrCreateSessionId() : null);
      syncFrom(res.data);
    } catch {
      // fallback: keep current state (e.g. backend not running during UI dev)
      setItems((prev) => prev);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addItem = async (item) => {
    try {
      const payload = {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity || 1,
        ...(!user ? { sessionId: getOrCreateSessionId() } : {}),
      };
      const res = await cartApi.addItem(payload);
      syncFrom(res.data);
      return { ok: true };
    } catch (err) {
      // fallback local optimistic add for resilience
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.variantId === item.variantId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + (item.quantity || 1) };
          return copy;
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
      return { ok: false, error: err?.message || 'Failed to add item' };
    }
  };

  const removeItem = async (variantIdOrItemId) => {
    const target = items.find((i) => i.variantId === variantIdOrItemId || i.cartItemId === variantIdOrItemId || i.id === variantIdOrItemId);
    try {
      if (target?.cartItemId || target?.id) {
        const res = await cartApi.removeItem(target.cartItemId || target.id, !user ? getOrCreateSessionId() : null);
        syncFrom(res.data);
        return;
      }
    } catch {}
    setItems((prev) => prev.filter((i) => !(i.variantId === variantIdOrItemId || i.cartItemId === variantIdOrItemId || i.id === variantIdOrItemId)));
  };

  const updateQuantity = async (variantIdOrItemId, quantity) => {
    const q = Math.max(1, quantity);
    const target = items.find((i) => i.variantId === variantIdOrItemId || i.cartItemId === variantIdOrItemId || i.id === variantIdOrItemId);
    try {
      if (target?.cartItemId || target?.id) {
        const res = await cartApi.updateItem(target.cartItemId || target.id, { quantity: q, ...(!user ? { sessionId: getOrCreateSessionId() } : {}) });
        syncFrom(res.data);
        return;
      }
    } catch {}
    setItems((prev) => prev.map((i) => ((i.variantId === variantIdOrItemId || i.cartItemId === variantIdOrItemId || i.id === variantIdOrItemId) ? { ...i, quantity: q } : i)));
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clear(!user ? getOrCreateSessionId() : null);
      syncFrom(res.data);
    } catch {
      setItems([]); setSubtotal(0); setCount(0);
    }
  };

  // recompute local totals if fallback modified items
  useEffect(() => {
    if (!loading) {
      const s = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 0), 0);
      const c = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
      setSubtotal((prev) => (items.every(i => i.cartItemId || i.id) ? prev : s));
      setCount((prev) => (items.every(i => i.cartItemId || i.id) ? prev : c));
    }
  }, [items, loading]);

  const value = useMemo(() => ({ items, addItem, removeItem, updateQuantity, clearCart, subtotal, count, loading, refreshCart, sessionId }), [items, subtotal, count, loading, refreshCart, sessionId]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
