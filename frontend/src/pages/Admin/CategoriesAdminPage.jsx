import { useEffect, useState } from 'react';
import { adminApi } from '../../services/admin';

const empty = { name: '', slug: '', description: '', imageUrl: '', isActive: true };

export default function CategoriesAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(''); const [error, setError] = useState('');

  const load = async () => { try { const res = await adminApi.listCategories(); setItems(res.data || []); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    try {
      const payload = { ...form, description: form.description || null, imageUrl: form.imageUrl || null };
      if (editing) await adminApi.updateCategory(editing, payload); else await adminApi.createCategory(payload);
      setMsg(editing ? 'Category updated.' : 'Category created.');
      setForm(empty); setEditing(null); await load();
    } catch (e2) { setError(e2.message || 'Save failed'); }
  };

  const edit = (c) => { setEditing(c.id); setForm({ name: c.name||'', slug: c.slug||'', description: c.description||'', imageUrl: c.imageUrl||'', isActive: c.isActive!==false }); };
  const del = async (id) => { if (!confirm('Delete category?')) return; try { await adminApi.deleteCategory(id); await load(); } catch(e){ setError(e.message); } };

  return (
    <div className="space-y-4">
      <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Categories</h1></div>
      {msg && <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="border border-light-grey bg-white p-4 space-y-3 h-fit">
          <h2 className="font-heading text-lg font-bold uppercase">{editing ? 'Edit' : 'Create'} Category</h2>
          <input className="input-field" placeholder="Name *" required value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
          <input className="input-field" placeholder="Slug (e.g. t-shirts) *" required value={form.slug} onChange={(e)=>setForm(f=>({...f,slug:e.target.value}))} />
          <input className="input-field" placeholder="Image URL" value={form.imageUrl} onChange={(e)=>setForm(f=>({...f,imageUrl:e.target.value}))} />
          <textarea className="input-field" rows={3} placeholder="Description" value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f,isActive:e.target.checked}))} /> Active</label>
          <div className="flex gap-2"><button className="btn-primary">{editing ? 'Update' : 'Create'}</button>{editing && <button type="button" className="btn-secondary" onClick={()=>{setEditing(null);setForm(empty);}}>Cancel</button>}</div>
        </form>
        <div className="border border-light-grey bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low font-label text-[11px] uppercase"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Slug</th><th className="p-3">Active</th><th className="p-3">Products</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-light-grey">
                  <td className="p-3 font-semibold">{c.name}</td><td className="p-3 text-on-surface-variant">{c.slug}</td><td className="p-3 text-center">{c.isActive ? 'Yes' : 'No'}</td><td className="p-3 text-center">{c._count?.products ?? 0}</td>
                  <td className="p-3 text-center space-x-2"><button className="underline" onClick={()=>edit(c)}>Edit</button><button className="underline text-red-700" onClick={()=>del(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
