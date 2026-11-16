import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/admin';
import { formatDZD } from '../../utils/format';

const emptyVariant = () => ({ sku: '', sizeId: '', colorId: '', price: '', salePrice: '', stock: 0, lowStock: 5, isActive: true });
const emptyImage = () => ({ url: '', alt: '', sortOrder: 0 });
const emptyForm = () => ({
  name: '', slug: '', description: '', basePrice: 0, salePrice: '', categoryId: '',
  isActive: true, isFeatured: false, isCustomizable: false,
  images: [emptyImage()], variants: [emptyVariant()],
});

function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ProductsAdminPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, c, s, col] = await Promise.all([
        adminApi.listProducts({ limit: 100 }),
        adminApi.listCategories(),
        adminApi.listSizes(),
        adminApi.listColors(),
      ]);
      setItems(p.data || []);
      setCategories(c.data || []);
      setSizes(s.data || []);
      setColors(col.data || []);
      if (!form.categoryId && (c.data || [])[0]?.id) setForm((f) => ({ ...f, categoryId: c.data[0].id }));
    } catch (e) { setError(e.message || 'Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateVariant = (i, patch) => setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, ...patch } : v) }));
  const updateImage = (i, patch) => setForm((f) => ({ ...f, images: f.images.map((im, idx) => idx === i ? { ...im, ...patch } : im) }));

  const startEdit = async (id) => {
    setMsg(''); setError('');
    try {
      const res = await adminApi.getProduct(id);
      const p = res.data;
      setEditingId(p.id);
      setForm({
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        basePrice: p.basePrice ?? 0,
        salePrice: p.salePrice ?? '',
        categoryId: p.categoryId || '',
        isActive: !!p.isActive,
        isFeatured: !!p.isFeatured,
        isCustomizable: !!p.isCustomizable,
        images: (p.images && p.images.length ? p.images : [emptyImage()]).map((im, i) => ({ url: im.url || '', alt: im.alt || '', sortOrder: im.sortOrder ?? i })),
        variants: (p.variants && p.variants.length ? p.variants : [emptyVariant()]).map((v) => ({
          sku: v.sku || '',
          sizeId: v.sizeId || '',
          colorId: v.colorId || '',
          price: v.price ?? '',
          salePrice: v.salePrice ?? '',
          stock: v.inventory?.quantity ?? 0,
          lowStock: v.inventory?.lowStock ?? 5,
          isActive: v.isActive !== false,
        })),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setError(e.message || 'Failed to load product'); }
  };

  const reset = () => { setEditingId(null); setForm(emptyForm()); if (categories[0]) setForm((f)=>({ ...f, categoryId: categories[0].id })); };

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setError(''); setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        basePrice: Number(form.basePrice) || 0,
        salePrice: form.salePrice === '' ? null : Number(form.salePrice),
        categoryId: form.categoryId,
        isActive: !!form.isActive,
        isFeatured: !!form.isFeatured,
        isCustomizable: !!form.isCustomizable,
        images: form.images.filter((im) => im.url && im.url.trim()).map((im, i) => ({ url: im.url.trim(), alt: im.alt || null, sortOrder: Number(im.sortOrder ?? i) || 0 })),
        variants: form.variants.map((v) => ({
          sku: String(v.sku || '').trim(),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          price: v.price === '' ? null : Number(v.price),
          salePrice: v.salePrice === '' ? null : Number(v.salePrice),
          isActive: v.isActive !== false,
          stock: Number(v.stock) || 0,
          lowStock: Number(v.lowStock) || 0,
        })),
      };
      if (!payload.variants.length) throw new Error('At least one variant is required');
      if (editingId) await adminApi.updateProduct(editingId, payload);
      else await adminApi.createProduct(payload);
      setMsg(editingId ? 'Product updated.' : 'Product created.');
      reset();
      await load();
    } catch (e2) { setError(e2.details ? `${e2.message}: ${JSON.stringify(e2.details)}` : (e2.message || 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this product? This may fail if referenced by orders.')) return;
    setMsg(''); setError('');
    try { await adminApi.deleteProduct(id); setMsg('Product deleted.'); await load(); }
    catch (e) { setError(e.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-4">
      <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Products & Inventory</h1></div>
      {msg && <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">{error}</div>}

      <form onSubmit={submit} className="border border-light-grey bg-white p-4 lg:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold uppercase text-primary">{editingId ? 'Edit Product' : 'Create Product'}</h2>
          {editingId && <button type="button" className="btn-secondary !py-1.5" onClick={reset}>Cancel Edit</button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="font-label text-[11px] uppercase">Name *</label><input className="input-field mt-1" required value={form.name} onChange={(e)=>{ setField('name', e.target.value); if (!editingId) setField('slug', slugify(e.target.value)); }} /></div>
          <div><label className="font-label text-[11px] uppercase">Slug *</label><input className="input-field mt-1" required value={form.slug} onChange={(e)=>setField('slug', e.target.value)} /></div>
          <div><label className="font-label text-[11px] uppercase">Category *</label><select className="input-field mt-1" required value={form.categoryId} onChange={(e)=>setField('categoryId', e.target.value)}><option value="">Select...</option>{categories.map(c=> <option key={c.id} value={c.id}>{c.name}{c.isActive===false?' (inactive)':''}</option>)}</select></div>
          <div><label className="font-label text-[11px] uppercase">Base price (DZD) *</label><input className="input-field mt-1" type="number" min="0" required value={form.basePrice} onChange={(e)=>setField('basePrice', e.target.value)} /></div>
          <div><label className="font-label text-[11px] uppercase">Sale price (DZD)</label><input className="input-field mt-1" type="number" min="0" value={form.salePrice} onChange={(e)=>setField('salePrice', e.target.value)} /></div>
          <div className="flex flex-wrap items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e)=>setField('isActive', e.target.checked)} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e)=>setField('isFeatured', e.target.checked)} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isCustomizable} onChange={(e)=>setField('isCustomizable', e.target.checked)} /> Customizable</label>
          </div>
        </div>
        <div><label className="font-label text-[11px] uppercase">Description *</label><textarea className="input-field mt-1" rows={3} required value={form.description} onChange={(e)=>setField('description', e.target.value)} /></div>

        <div className="border border-light-grey p-3">
          <div className="flex items-center justify-between mb-2"><h3 className="font-label text-xs uppercase tracking-label">Images</h3><button type="button" className="btn-secondary !py-1 !px-2 !text-[10px]" onClick={()=>setForm(f=>({...f, images:[...f.images, emptyImage()]}))}>Add Image</button></div>
          <div className="space-y-2">
            {form.images.map((im, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_80px_auto] items-end">
                <input className="input-field !py-2" placeholder="Image URL *" value={im.url} onChange={(e)=>updateImage(i,{url:e.target.value})} />
                <input className="input-field !py-2" placeholder="Alt text" value={im.alt} onChange={(e)=>updateImage(i,{alt:e.target.value})} />
                <input className="input-field !py-2" type="number" placeholder="Sort" value={im.sortOrder} onChange={(e)=>updateImage(i,{sortOrder:e.target.value})} />
                <button type="button" className="text-xs underline text-red-700 pb-2" onClick={()=>setForm(f=>({...f, images: f.images.filter((_,idx)=>idx!==i)}))} disabled={form.images.length===1}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-light-grey p-3">
          <div className="flex items-center justify-between mb-2"><h3 className="font-label text-xs uppercase tracking-label">Variants & Inventory</h3><button type="button" className="btn-secondary !py-1 !px-2 !text-[10px]" onClick={()=>setForm(f=>({...f, variants:[...f.variants, emptyVariant()]}))}>Add Variant</button></div>
          <div className="space-y-3">
            {form.variants.map((v, i) => (
              <div key={i} className="border border-light-grey bg-surface-container-low p-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div><label className="font-label text-[10px] uppercase">SKU *</label><input className="input-field mt-1 !py-2" required value={v.sku} onChange={(e)=>updateVariant(i,{sku:e.target.value})} /></div>
                  <div><label className="font-label text-[10px] uppercase">Size</label><select className="input-field mt-1 !py-2" value={v.sizeId} onChange={(e)=>updateVariant(i,{sizeId:e.target.value})}><option value="">—</option>{sizes.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  <div><label className="font-label text-[10px] uppercase">Color</label><select className="input-field mt-1 !py-2" value={v.colorId} onChange={(e)=>updateVariant(i,{colorId:e.target.value})}><option value="">—</option>{colors.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="font-label text-[10px] uppercase">Stock *</label><input className="input-field mt-1 !py-2" type="number" min="0" value={v.stock} onChange={(e)=>updateVariant(i,{stock:e.target.value})} /></div>
                  <div><label className="font-label text-[10px] uppercase">Low stock</label><input className="input-field mt-1 !py-2" type="number" min="0" value={v.lowStock} onChange={(e)=>updateVariant(i,{lowStock:e.target.value})} /></div>
                  <div><label className="font-label text-[10px] uppercase">Variant price</label><input className="input-field mt-1 !py-2" type="number" min="0" placeholder="(base)" value={v.price} onChange={(e)=>updateVariant(i,{price:e.target.value})} /></div>
                  <div><label className="font-label text-[10px] uppercase">Variant sale price</label><input className="input-field mt-1 !py-2" type="number" min="0" value={v.salePrice} onChange={(e)=>updateVariant(i,{salePrice:e.target.value})} /></div>
                  <div className="flex items-end justify-between gap-2 pb-1">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.isActive!==false} onChange={(e)=>updateVariant(i,{isActive:e.target.checked})} /> Active</label>
                    <button type="button" className="text-xs underline text-red-700" onClick={()=>setForm(f=>({...f, variants: f.variants.filter((_,idx)=>idx!==i)}))} disabled={form.variants.length===1}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant">Saving replaces product images/variants on update (backend behavior). Manage stock via variant stock field.</p>
        </div>

        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}</button>
      </form>

      <div className="border border-light-grey bg-white overflow-x-auto">
        <div className="flex items-center justify-between p-3 border-b border-light-grey"><h2 className="font-heading text-lg font-bold uppercase text-primary">Catalog</h2><button className="btn-secondary !py-1.5" onClick={load}>Refresh</button></div>
        {loading ? <p className="p-4 text-sm text-on-surface-variant">Loading...</p> : items.length === 0 ? <p className="p-4 text-sm text-on-surface-variant">No products found.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low font-label text-[11px] uppercase"><tr><th className="p-3 text-left">Product</th><th className="p-3 text-left">Category</th><th className="p-3">Price</th><th className="p-3">Variants</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {items.map((p) => {
                const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.inventory?.quantity || 0), 0);
                return (
                  <tr key={p.id} className="border-t border-light-grey align-top">
                    <td className="p-3"><div className="font-semibold text-primary">{p.name}</div><div className="text-xs text-on-surface-variant">{p.slug}</div><div className="text-xs text-on-surface-variant">Stock total: {totalStock}</div></td>
                    <td className="p-3 text-on-surface-variant">{catMap[p.categoryId] || p.category?.name || '—'}</td>
                    <td className="p-3 text-center font-label">{formatDZD(p.salePrice ?? p.basePrice)}{p.salePrice ? <div className="text-[11px] text-on-surface-variant line-through">{formatDZD(p.basePrice)}</div> : null}</td>
                    <td className="p-3 text-xs text-on-surface-variant">{(p.variants||[]).map(v => `${v.sku} (${v.inventory?.quantity ?? 0})`).join(', ') || '—'}</td>
                    <td className="p-3 text-center"><div>{p.isActive ? 'Active' : 'Inactive'}</div><div className="text-xs text-on-surface-variant">{p.isFeatured ? 'Featured' : ''} {p.isCustomizable ? 'Custom' : ''}</div></td>
                    <td className="p-3 text-center space-x-2 whitespace-nowrap"><button className="underline" onClick={()=>startEdit(p.id)}>Edit</button><button className="underline text-red-700" onClick={()=>remove(p.id)}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
