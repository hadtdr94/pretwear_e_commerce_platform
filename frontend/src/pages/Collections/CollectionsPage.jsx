import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../../services/catalog';
import { normalizeProduct } from '../../utils/product';
import ProductCard from '../../components/products/ProductCard';

export default function CollectionsPage() {
  const [categories, setCategories] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catRes = await catalogApi.listCategories();
        const cats = (catRes.data || []).slice(0, 6);
        if (!mounted) return;
        setCategories(cats);
        const entries = await Promise.all(cats.map(async (cat) => {
          try {
            const res = await catalogApi.listProducts({ category: cat.slug || cat.name, limit: 4 });
            return [cat.id, (res.data || []).map(normalizeProduct)];
          } catch { return [cat.id, []]; }
        }));
        if (mounted) setByCategory(Object.fromEntries(entries));
      } catch {
        if (mounted) { setCategories([]); setByCategory({}); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-surface-container-low py-12">
        <div className="container-shell">
          <p className="section-kicker">Collections</p>
          <h1 className="section-title mt-1">Curated Collections</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">Collections and featured groupings from the catalog. Content can be managed from admin in later phases.</p>
        </div>
      </section>
      <section className="container-shell py-12 space-y-10">
        {loading ? (
          <div className="border border-light-grey bg-white p-8 text-center text-sm text-on-surface-variant">Loading collections...</div>
        ) : categories.length === 0 ? (
          <div className="border border-light-grey bg-white p-8 text-center text-sm text-on-surface-variant">No collections available yet. Seed the database and ensure backend is running.</div>
        ) : categories.map((cat) => {
          const items = byCategory[cat.id] || [];
          return (
            <div key={cat.id}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div><p className="section-kicker">Collection</p><h2 className="font-heading text-2xl font-bold uppercase text-primary">{cat.name}</h2></div>
                <Link to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} className="font-label text-xs uppercase underline underline-offset-4">View in shop</Link>
              </div>
              {items.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              ) : (
                <div className="border border-light-grey bg-white p-6 text-sm text-on-surface-variant">No products in this collection yet.</div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
