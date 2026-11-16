import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { WILAYAS } from '../../data/sampleData';
import { formatDZD } from '../../utils/format';
import { ordersApi } from '../../services/orders';
import { catalogApi } from '../../services/catalog';

export default function CheckoutPage() {
  const { items, subtotal, clearCart, sessionId } = useCart();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', wilaya: WILAYAS[15], commune: '', address: '', notes: '' });
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [confirmed, setConfirmed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    catalogApi.listDeliveryZones().then((res) => setDeliveryZones(res.data || [])).catch(() => setDeliveryZones([]));
  }, []);

  const deliveryFee = useMemo(() => {
    if (!items.length) return 0;
    const zone = deliveryZones.find((z) => z.wilaya === form.wilaya && (z.commune === form.commune || !z.commune))
      || deliveryZones.find((z) => z.wilaya === form.wilaya);
    return zone?.fee ?? (items.length ? 600 : 0);
  }, [deliveryZones, form.wilaya, form.commune, items.length]);
  const total = subtotal + deliveryFee;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true); setError('');
    try {
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || undefined,
        wilaya: form.wilaya,
        commune: form.commune,
        address: form.address,
        notes: form.notes || undefined,
        paymentMethod: 'COD',
        ...(sessionId ? { sessionId } : {}),
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      };
      const res = await ordersApi.create(payload);
      setConfirmed(res.data);
      await clearCart();
    } catch (err) {
      setError(err.message || 'Failed to place order. Please verify stock/inputs and ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-surface">
        <section className="container-shell py-16">
          <div className="mx-auto max-w-2xl border border-light-grey bg-white p-8 text-center">
            <p className="section-kicker">Order Confirmed</p>
            <h1 className="mt-2 font-heading text-3xl font-bold uppercase text-primary">Thank You for Your Order</h1>
            <p className="mt-4 text-on-surface-variant">Your order reference is:</p>
            <p className="mt-2 font-label text-2xl font-bold tracking-wider text-primary">{confirmed.reference}</p>
            <p className="mt-2 text-sm text-on-surface-variant">Status: {confirmed.status} • Total: {formatDZD(confirmed.total)} • Payment: {confirmed.payment?.method || 'COD'}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="btn-primary">Continue Shopping</Link>
              <Link to="/account" className="btn-secondary">View Account</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <section className="container-shell py-12">
        <p className="section-kicker">Checkout</p>
        <h1 className="section-title mt-1">Complete Your Order</h1>
        {items.length === 0 ? (
          <div className="mt-8 border border-light-grey bg-white p-8 text-center">
            <p className="text-on-surface-variant">Your cart is empty.</p>
            <Link to="/shop" className="btn-primary mt-4">Return to Shop</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <form onSubmit={onSubmit} className="space-y-4 border border-light-grey bg-white p-6 lg:col-span-7">
              <h2 className="font-heading text-xl font-bold uppercase text-primary">Delivery & Customer Information</h2>
              {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="font-label text-xs uppercase">Full name *</label><input name="customerName" required value={form.customerName} onChange={onChange} className="input-field mt-1" /></div>
                <div><label className="font-label text-xs uppercase">Phone number *</label><input name="customerPhone" required value={form.customerPhone} onChange={onChange} className="input-field mt-1" /></div>
                <div><label className="font-label text-xs uppercase">Email (optional)</label><input name="customerEmail" type="email" value={form.customerEmail} onChange={onChange} className="input-field mt-1" /></div>
                <div><label className="font-label text-xs uppercase">Wilaya *</label><select name="wilaya" value={form.wilaya} onChange={onChange} className="input-field mt-1">{WILAYAS.map((w) => <option key={w}>{w}</option>)}</select></div>
                <div><label className="font-label text-xs uppercase">Commune *</label><input name="commune" required value={form.commune} onChange={onChange} className="input-field mt-1" /></div>
                <div className="sm:col-span-2"><label className="font-label text-xs uppercase">Full delivery address *</label><textarea name="address" required rows={3} value={form.address} onChange={onChange} className="input-field mt-1" /></div>
                <div className="sm:col-span-2"><label className="font-label text-xs uppercase">Order notes</label><textarea name="notes" rows={3} value={form.notes} onChange={onChange} className="input-field mt-1" /></div>
              </div>
              <div className="border border-light-grey bg-surface-container-low p-4">
                <p className="font-label text-xs uppercase tracking-label text-primary">Payment</p>
                <label className="mt-2 flex items-center gap-2 text-sm"><input type="radio" checked readOnly /> Cash on delivery (COD)</label>
                <p className="mt-1 text-xs text-on-surface-variant">Other payment methods will appear only when configured and supported.</p>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Placing order...' : 'Confirm Order'}</button>
            </form>

            <aside className="h-fit border border-light-grey bg-white p-5 lg:col-span-5">
              <h2 className="font-heading text-xl font-bold uppercase text-primary">Summary</h2>
              <div className="mt-4 space-y-3">
                {items.map((i) => (
                  <div key={i.variantId || i.cartItemId} className="flex items-start justify-between gap-3 border-b border-light-grey pb-2 text-sm">
                    <div><p className="font-semibold text-primary">{i.name}</p><p className="text-on-surface-variant">{i.color} / {i.size} × {i.quantity}</p></div>
                    <span className="font-label font-semibold">{formatDZD(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-label">{formatDZD(subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery (wilaya-configurable)</span><span className="font-label">{formatDZD(deliveryFee)}</span></div>
                <div className="flex justify-between border-t border-light-grey pt-2 text-base font-semibold text-primary"><span>Total</span><span className="font-label">{formatDZD(total)}</span></div>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">Final totals, delivery fee and stock are validated by the server.</p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
