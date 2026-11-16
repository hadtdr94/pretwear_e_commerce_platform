import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Truck } from 'lucide-react';
import { catalogApi } from '../../services/catalog';
import { formatDZD } from '../../utils/format';
import { normalizeProduct } from '../../utils/product';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/products/ProductCard';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(''); setMessage('');
    catalogApi.getProduct(slug)
      .then(async (res) => {
        if (!mounted) return;
        const p = normalizeProduct(res.data);
        setProduct(p);
        setActiveImage(0);
        setSelectedColor(p.colors?.[0] || '');
        setSelectedSize(p.sizes?.[0] || '');
        if (p?.categorySlug || p?.categoryId) {
          try {
            const rel = await catalogApi.listProducts({ category: p.categorySlug || p.category, limit: 8 });
            if (!mounted) return;
            setRelated((rel.data || []).map(normalizeProduct).filter((x) => x.id !== p.id).slice(0, 4));
          } catch { setRelated([]); }
        } else setRelated([]);
      })
      .catch((err) => { if (mounted) setError(err.message || 'Product not found'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
      || product.variants.find((v) => v.color === selectedColor)
      || product.variants.find((v) => v.size === selectedSize)
      || product.variants[0] || null;
  }, [product, selectedColor, selectedSize]);

  if (loading) return <div className="container-shell py-20 text-center text-on-surface-variant">Loading product...</div>;
  if (error || !product) return <div className="container-shell py-20 text-center"><p className="font-heading text-2xl uppercase text-primary">Product not found</p><p className="mt-2 text-on-surface-variant">{error || 'This product is unavailable.'}</p><Link to="/shop" className="btn-primary mt-6">Back to shop</Link></div>;

  const stock = selectedVariant?.stock ?? selectedVariant?.inventory?.quantity ?? 0;
  const inStock = stock > 0;
  const displayPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.basePrice ?? product.price ?? 0;
  const canAdd = !product.quoteOnly && selectedVariant && inStock && qty > 0 && qty <= stock;

  const handleAdd = async (goCheckout = false) => {
    if (product.quoteOnly) { navigate('/customization'); return; }
    if (!selectedVariant) { setMessage('Please select a valid size and color.'); return; }
    if (!inStock) { setMessage('Selected variant is out of stock.'); return; }
    if (qty > stock) { setMessage('Requested quantity exceeds available stock for this variant.'); return; }
    const res = await addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: displayPrice,
      image: product.images?.[0],
      color: selectedVariant.color,
      size: selectedVariant.size,
      quantity: qty,
    });
    setMessage(res?.ok === false ? (res.error || 'Could not add to cart. Ensure backend is running.') : 'Added to cart.');
    if (goCheckout && res?.ok !== false) navigate('/checkout');
  };

  return (
    <div className="bg-surface">
      <div className="container-shell py-8">
        <div className="mb-4 font-label text-xs uppercase tracking-label text-on-surface-variant">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> / <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="border border-light-grey bg-white p-3">
              <img src={product.images?.[activeImage] || product.images?.[0]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {(product.images || []).map((img, i) => (
                <button key={`${img}-${i}`} type="button" onClick={() => setActiveImage(i)} className={`border bg-white p-1 ${i === activeImage ? 'border-primary' : 'border-light-grey'}`}>
                  <img src={img} alt={`${product.name} ${i + 1}`} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="border border-light-grey bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {(product.badges || []).map((b) => <span key={b} className="chip">{b}</span>)}
                <span className={`chip ${inStock ? '!border-green-200 !bg-green-50 !text-green-700' : '!border-red-200 !bg-red-50 !text-red-700'}`}>{inStock ? 'In stock' : 'Out of stock'}</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-primary">{product.name}</h1>
              <p className="mt-2 text-sm text-on-surface-variant">{product.description}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-label text-3xl font-bold text-primary">{formatDZD(displayPrice)}</span>
                {(product.salePrice && product.salePrice < (product.basePrice || product.price)) ? <span className="text-sm text-on-surface-variant line-through">{formatDZD(product.basePrice || product.price)}</span> : null}
                <span className="font-label text-xs uppercase text-on-surface-variant">DZD</span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="font-label text-xs uppercase tracking-label text-primary">Color</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(product.colors || []).map((c) => (
                      <button key={c} type="button" onClick={() => setSelectedColor(c)} className={`border px-3 py-2 font-label text-xs uppercase tracking-label ${selectedColor === c ? 'border-primary bg-primary text-white' : 'border-light-grey bg-surface-container-low text-primary'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between"><p className="font-label text-xs uppercase tracking-label text-primary">Size</p><button type="button" className="font-label text-[11px] uppercase underline underline-offset-4" onClick={() => alert('Size guide: choose your usual size for a regular fit, or size up for an oversized boxy fit. Detailed measurements can be managed in settings/content.')}>Size guide</button></div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(product.sizes || []).map((s) => (
                      <button key={s} type="button" onClick={() => setSelectedSize(s)} className={`min-w-[44px] border px-3 py-2 font-label text-xs uppercase ${selectedSize === s ? 'border-primary bg-primary text-white' : 'border-light-grey bg-surface-container-low text-primary'}`}>{s}</button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">Selected variant stock: <strong className="text-primary">{stock}</strong> {selectedVariant?.sku ? `• SKU: ${selectedVariant.sku}` : ''}</p>
                </div>
                <div>
                  <p className="font-label text-xs uppercase tracking-label text-primary">Quantity</p>
                  <div className="mt-2 inline-flex border border-light-grey">
                    <button type="button" className="h-10 w-10 bg-surface-container-low" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                    <span className="inline-flex h-10 w-12 items-center justify-center font-label font-semibold">{qty}</span>
                    <button type="button" className="h-10 w-10 bg-surface-container-low" onClick={() => setQty((q) => q + 1)}>+</button>
                  </div>
                </div>
              </div>

              {message && <div className="mt-4 border border-light-grey bg-surface-container-low p-3 text-sm text-primary">{message}</div>}

              <div className="mt-5 grid gap-2">
                <button type="button" className="btn-primary w-full" onClick={() => handleAdd(false)} disabled={!canAdd && !product.quoteOnly}>
                  {product.quoteOnly ? 'Request Quote / Customize' : 'Add to Cart'}
                </button>
                <button type="button" className="btn-secondary w-full" onClick={() => handleAdd(true)} disabled={!canAdd && !product.quoteOnly}>Buy Now</button>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">A valid size, color, and quantity must be selected before adding to cart. Stock and pricing are validated server-side at checkout.</p>
            </div>

            <div className="border border-light-grey bg-white p-5">
              <p className="font-label text-xs uppercase tracking-label text-primary">Delivery information</p>
              <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                <p className="flex items-center gap-2"><Truck size={16} className="text-accent" /> Delivery across 58 Algerian wilayas via configurable delivery zones/fees.</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-accent" /> Cash on delivery (COD) supported at checkout.</p>
              </div>
            </div>

            <div className="border border-light-grey bg-white p-5">
              <p className="font-label text-xs uppercase tracking-label text-primary">Product specifications</p>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                {(product.specs || []).map((s) => <li key={s} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 bg-primary" />{s}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="section-title">Related Products</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
