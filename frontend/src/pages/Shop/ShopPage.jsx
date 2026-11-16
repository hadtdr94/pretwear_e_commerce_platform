import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard';
import { catalogApi } from '../../services/catalog';
import { normalizeProduct } from '../../utils/product';

const PAGE_SIZE = 9;

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [size, setSize] = useState(searchParams.get('size') || 'All');
  const [color, setColor] = useState(searchParams.get('color') || 'All');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice') || 10000));
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    catalogApi.listCategories().then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sort: sort === 'popularity' ? 'newest' : sort,
      maxPrice,
    };
    if (search.trim()) params.q = search.trim();
    if (category !== 'All') params.category = category;
    if (size !== 'All') params.size = size;
    if (color !== 'All') params.color = color;
    if (availability === 'In stock') params.inStock = 'true';
    setLoading(true);
    setError('');
    catalogApi.listProducts(params)
      .then((res) => {
        let list = (res.data || []).map(normalizeProduct);
        if (availability === 'Quote only') list = list.filter((p) => p.quoteOnly || (p.price === 0 && !p.salePrice));
        if (sort === 'popularity') list = [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        setProducts(list);
        setMeta(res.meta || { total: list.length, page, totalPages: 1 });
      })
      .catch((err) => {
        setError(err.message || 'Failed to load products. Ensure backend is running and database is migrated/seeded.');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [search, category, size, color, availability, sort, maxPrice, page]);

  const allSizes = useMemo(() => ['All', ...Array.from(new Set(products.flatMap((p) => p.sizes || [])))], [products]);
  const allColors = useMemo(() => ['All', ...Array.from(new Set(products.flatMap((p) => p.colors || [])))], [products]);

  const sync = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || v === 'All') next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  };

  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-surface-container-low">
        <div className="container-shell py-10">
          <p className="section-kicker">PRETWEAR Atelier Store</p>
          <h1 className="section-title mt-1">Shop Catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">Browse products from the catalog. Data is loaded from the PRETWEAR API (seeded SAMPLE/DEMO data in development).</p>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-10 lg:grid-cols-12">
        <aside className="space-y-5 border border-light-grey bg-white p-4 lg:sticky lg:top-24 lg:col-span-3 lg:h-fit">
          <div>
            <label className="font-label text-xs uppercase tracking-label text-primary">Search</label>
            <input className="input-field mt-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); sync({ q: e.target.value, page: 1 }); }} placeholder="Search products..." />
          </div>
          <div>
            <label className="font-label text-xs uppercase tracking-label text-primary">Category</label>
            <select className="input-field mt-1" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); sync({ category: e.target.value, page: 1 }); }}>
              <option>All</option>
              {categories.map((c) => <option key={c.id} value={c.slug || c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label text-xs uppercase tracking-label text-primary">Size</label>
              <select className="input-field mt-1" value={size} onChange={(e) => { setSize(e.target.value); setPage(1); sync({ size: e.target.value, page: 1 }); }}>
                {['All', ...Array.from(new Set([...allSizes.filter(s => s !== 'All'), 'XS','S','M','L','XL','XXL','Adjustable']))].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-label text-primary">Color</label>
              <select className="input-field mt-1" value={color} onChange={(e) => { setColor(e.target.value); setPage(1); sync({ color: e.target.value, page: 1 }); }}>
                {['All', ...Array.from(new Set([...allColors.filter(c => c !== 'All'), 'Black','White','Ecru','Navy','Olive','Charcoal','Stone','Bordeaux']))].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="font-label text-xs uppercase tracking-label text-primary">Availability</label>
            <select className="input-field mt-1" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); sync({ availability: e.target.value, page: 1 }); }}>
              {['All', 'In stock', 'Quote only'].map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between"><label className="font-label text-xs uppercase tracking-label text-primary">Max Price</label><span className="font-label text-xs">{maxPrice.toLocaleString()} DZD</span></div>
            <input type="range" min="0" max="10000" step="500" value={maxPrice} onChange={(e) => { const v = Number(e.target.value); setMaxPrice(v); setPage(1); sync({ maxPrice: v, page: 1 }); }} className="mt-2 w-full accent-primary" />
          </div>
          <button type="button" className="btn-secondary w-full" onClick={() => { setSearch(''); setCategory('All'); setSize('All'); setColor('All'); setAvailability('All'); setSort('newest'); setMaxPrice(10000); setPage(1); setSearchParams({}); }}>Reset Filters</button>
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-4 flex flex-col gap-3 border border-light-grey bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-label text-xs uppercase tracking-label text-on-surface-variant"><span className="font-bold text-primary">{meta.total ?? products.length}</span> products found</p>
            <div className="flex items-center gap-2">
              <label className="font-label text-xs uppercase tracking-label text-on-surface-variant">Sort</label>
              <select className="input-field !w-auto !py-2" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); sync({ sort: e.target.value, page: 1 }); }}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>

          {error && <div className="mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {loading ? (
            <div className="border border-light-grey bg-white p-10 text-center text-sm text-on-surface-variant">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="border border-light-grey bg-white p-10 text-center">
              <p className="font-heading text-xl uppercase text-primary">No products match your filters</p>
              <p className="mt-2 text-sm text-on-surface-variant">Try adjusting search or filters, or seed the database.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border border-light-grey bg-white p-3">
            <button type="button" className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => { const n = Math.max(1, page - 1); setPage(n); sync({ page: n }); }}>Previous</button>
            <p className="font-label text-xs uppercase tracking-label text-on-surface-variant">Page {meta.page || page} / {meta.totalPages || 1}</p>
            <button type="button" className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40" disabled={(meta.totalPages || 1) <= page || loading} onClick={() => { const n = page + 1; setPage(n); sync({ page: n }); }}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
