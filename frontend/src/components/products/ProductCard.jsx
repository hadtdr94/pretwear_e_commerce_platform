import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatDZD } from '../../utils/format';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const firstVariant = product.variants?.[0];
  const displayPrice = product.salePrice ?? product.price;
  const canQuickAdd = firstVariant && !product.quoteOnly && Number(product.price) > 0;

  const onQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canQuickAdd) return;
    await addItem({
      productId: product.id,
      variantId: firstVariant.id,
      name: product.name,
      price: displayPrice,
      image: product.images?.[0],
      color: firstVariant.color,
      size: firstVariant.size,
      quantity: 1,
    });
  };

  return (
    <Link to={`/product/${product.slug}`} className="group flex h-full flex-col border border-light-grey bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {(product.badges || []).slice(0, 2).map((b) => (
            <span key={b} className="bg-primary px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-label text-white">{b}</span>
          ))}
        </div>
        <button type="button" aria-label="Favorite" className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center bg-white/90 text-primary hover:bg-primary hover:text-white" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <Heart size={16} />
        </button>
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          {canQuickAdd ? (
            <button type="button" onClick={onQuickAdd} className="btn-primary w-full py-2 text-xs">Quick Add</button>
          ) : (
            <span className="inline-flex w-full items-center justify-center border border-primary bg-white/95 px-3 py-2 font-label text-xs font-semibold uppercase tracking-label text-primary">View / Request Quote</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-label text-[11px] uppercase tracking-label text-on-surface-variant">{product.category}</p>
        <h3 className="mt-1 font-heading text-lg font-semibold uppercase leading-tight text-primary">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{product.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-label text-lg font-bold text-primary">{formatDZD(displayPrice)}</span>
            {product.salePrice ? <span className="text-xs text-on-surface-variant line-through">{formatDZD(product.price)}</span> : null}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(product.colors || []).slice(0, 3).map((c) => (
            <span key={c} className="chip !normal-case !tracking-normal">{c}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
