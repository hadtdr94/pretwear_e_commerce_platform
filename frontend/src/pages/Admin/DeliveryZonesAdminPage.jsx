import { useEffect, useState } from 'react';
import { adminApi } from '../../services/admin';
import { formatDZD } from '../../utils/format';

const empty = { wilaya: '', commune: '', fee: 600, isActive: true, etaMinDays: '', etaMaxDays: '' };

export default function DeliveryZonesAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(''); const [error, setError] = useState('');

  const load = async () => { try { const res = await adminApi.listDeliveryZones(); setItems(res.data || []); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    try {
      const payload = {
        wilaya: form.wilaya,
        commune: form.commune || null,
        fee: Number(form.fee) || 0,
        isActive: !!form.isActive,
        etaMinDays: form.etaMinDays === '' ? null : Number(form.etaMinDays),
        etaMaxDays: form.etaMaxDays === '' ? null : Number(form.etaMaxDays),
      };
      await adminApi.upsertDeliveryZone(payload);
      setMsg('Delivery zone saved.'); setForm(empty); await load();
    } catch (e2) { setError(e2.message || 'Save failed'); }
  };

  const del = async (id) => { if (!confirm('Delete delivery zone?')) return; try { await adminApi.deleteDeliveryZone(id); await load(); } catch(e){ setError(e.message); } };

  return (
    <div className="space-y-4">
      <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Delivery Zones</h1></div>
      {msg && <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="border border-light-grey bg-white p-4 space-y-3 h-fit">
          <h2 className="font-heading text-lg font-bold uppercase">Add / Update Zone</h2>
          <input className="input-field" placeholder="Wilaya * (e.g. 16 - Alger)" required value={form.wilaya} onChange={(e)=>setForm(f=>({...f,wilaya:e.target.value}))} />
          <input className="input-field" placeholder="Commune (optional, blank = wilaya default)" value={form.commune} onChange={(e)=>setForm(f=>({...f,commune:e.target.value}))} />
          <input className="input-field" type="number" min="0" placeholder="Fee (DZD) *" required value={form.fee} onChange={(e)=>setForm(f=>({...f,fee:e.target.value}))} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input-field" type="number" min="0" placeholder="ETA min days" value={form.etaMinDays} onChange={(e)=>setForm(f=>({...f,etaMinDays:e.target.value}))} />
            <input className="input-field" type="number" min="0" placeholder="ETA max days" value={form.etaMaxDays} onChange={(e)=>setForm(f=>({...f,etaMaxDays:e.target.value}))} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f,isActive:e.target.checked}))} /> Active</label>
          <button className="btn-primary">Save Zone</button>
        </form>
        <div className="border border-light-grey bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low font-label text-[11px] uppercase"><tr><th className="p-3 text-left">Wilaya</th><th className="p-3 text-left">Commune</th><th className="p-3">Fee</th><th className="p-3">ETA</th><th className="p-3">Active</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {items.map((z) => (
                <tr key={z.id} className="border-t border-light-grey">
                  <td className="p-3 font-semibold">{z.wilaya}</td>
                  <td className="p-3 text-on-surface-variant">{z.commune || '— (default)'}</td>
                  <td className="p-3 text-center font-label">{formatDZD(z.fee)}</td>
                  <td className="p-3 text-center text-on-surface-variant">{z.etaMinDays ?? '—'}–{z.etaMaxDays ?? '—'} d</td>
                  <td className="p-3 text-center">{z.isActive ? 'Yes' : 'No'}</td>
                  <td className="p-3 text-center"><button className="underline text-red-700" onClick={()=>del(z.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
