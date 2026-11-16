import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatDZD } from '../../utils/format';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const delivery = items.length > 0 ? 600 : 0; // sample/configurable in later phases
  const total = subtotal + delivery;

  return (
    <div className="bg-surface">
      <section className="container-shell py-12">
        <p className="section-kicker">Shopping Bag</p>
        <h1 className="section-title mt-1">Cart</h1>
        {items.length === 0 ? (
          <div className="mt-8 border border-light-grey bg-white p-10 text-center">
            <p className="font-heading text-xl uppercase text-primary">Your cart is empty</p>
            <p className="mt-2 text-sm text-on-surface-variant">Browse the catalog and add products to your bag.</p>
            <Link to="/shop" className="btn-primary mt-5">Go to Shop</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {items.map((item) => (
                <div key={item.cartItemId || item.variantId} className="grid gap-4 border border-light-grey bg-white p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <img src={item.image} alt={item.name} className="h-28 w-full border border-light-grey object-cover" />
                  <div>
                    <h3 className="font-heading text-lg font-semibold uppercase text-primary">{item.name}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">Color: {item.color} • Size: {item.size}</p>
                    <p className="mt-1 font-label text-sm font-bold text-primary">{formatDZD(item.price)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex border border-light-grey">
                        <button type="button" className="h-9 w-9 bg-surface-container-low" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>-</button>
                        <span className="inline-flex h-9 w-10 items-center justify-center font-label text-sm font-semibold">{item.quantity}</span>
                        <button type="button" className="h-9 w-9 bg-surface-container-low" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="font-label text-xs uppercase underline underline-offset-4 text-on-surface-variant hover:text-primary" onClick={() => removeItem(item.variantId)}>Remove</button>
                    </div>
                  </div>
                  <div className="text-right font-label font-bold text-primary">{formatDZD(item.price * item.quantity)}</div>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={clearCart}>Clear Cart</button>
            </div>
            <aside className="h-fit border border-light-grey bg-white p-5 lg:col-span-4">
              <h2 className="font-heading text-xl font-bold uppercase text-primary">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-label font-semibold">{formatDZD(subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery (estimated/configurable)</span><span className="font-label font-semibold">{formatDZD(delivery)}</span></div>
                <div className="flex justify-between border-t border-light-grey pt-2 text-base font-semibold text-primary"><span>Total</span><span className="font-label">{formatDZD(total)}</span></div>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">Prices in DZD/DA. Final delivery fees by wilaya and stock validation are handled server-side at checkout.</p>
              <Link to="/checkout" className="btn-primary mt-5 w-full">Proceed to Checkout</Link>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
