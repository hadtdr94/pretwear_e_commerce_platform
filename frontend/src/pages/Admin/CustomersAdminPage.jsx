import { useEffect, useState } from 'react';
import { adminApi } from '../../services/admin';

export default function CustomersAdminPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const res = await adminApi.listCustomers({ ...(q ? { q } : {}), limit: 50 }); setItems(res.data || []); }
    catch (e) { setError(e.message || 'Failed to load customers'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Customers</h1></div>
        <div className="flex gap-2"><input className="input-field !w-56 !py-2" placeholder="Search name/email/phone" value={q} onChange={(e)=>setQ(e.target.value)} /><button className="btn-secondary !py-2" onClick={load}>Search</button></div>
      </div>
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="border border-light-grey bg-white overflow-x-auto">
        {loading ? <p className="p-4 text-sm text-on-surface-variant">Loading...</p> : items.length === 0 ? <p className="p-4 text-sm text-on-surface-variant">No customers found.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low font-label text-[11px] uppercase"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Phone</th><th className="p-3">Orders</th><th className="p-3">Requests</th><th className="p-3">Joined</th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-t border-light-grey">
                  <td className="p-3 font-semibold">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-on-surface-variant">{u.phone || '—'}</td>
                  <td className="p-3 text-center">{u._count?.orders ?? 0}</td>
                  <td className="p-3 text-center">{u._count?.customizationRequests ?? 0}</td>
                  <td className="p-3 text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
