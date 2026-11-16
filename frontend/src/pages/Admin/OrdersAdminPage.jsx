import { useEffect, useState } from 'react';
import { adminApi } from '../../services/admin';
import { formatDZD } from '../../utils/format';

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminApi.listOrders({ ...(status ? { status } : {}), ...(q ? { q } : {}), limit: 50 });
      setOrders(res.data || []);
    } catch (e) { setError(e.message || 'Failed to load orders'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);

  const update = async (id, newStatus) => {
    setMsg(''); setError('');
    try { await adminApi.updateOrderStatus(id, newStatus); setMsg('Order status updated.'); await load(); }
    catch (e) { setError(e.message || 'Update failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Orders</h1></div>
        <div className="flex flex-wrap gap-2">
          <input className="input-field !w-48 !py-2" placeholder="Search ref/name/phone" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="btn-secondary !py-2" onClick={load}>Search</button>
          <select className="input-field !w-auto !py-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {msg && <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="border border-light-grey bg-white overflow-x-auto">
        {loading ? <p className="p-4 text-sm text-on-surface-variant">Loading...</p> : orders.length === 0 ? <p className="p-4 text-sm text-on-surface-variant">No orders found.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-left font-label text-[11px] uppercase tracking-label">
              <tr><th className="p-3">Ref</th><th className="p-3">Customer</th><th className="p-3">Delivery</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-light-grey align-top">
                  <td className="p-3 font-label font-semibold">{o.reference}<div className="mt-1 text-[11px] font-normal text-on-surface-variant">{o.items?.length || 0} item(s)</div></td>
                  <td className="p-3"><div>{o.customerName}</div><div className="text-on-surface-variant">{o.customerPhone}</div></td>
                  <td className="p-3 text-on-surface-variant">{o.wilaya}<br/>{o.commune}</td>
                  <td className="p-3 font-label font-semibold">{formatDZD(o.total)}</td>
                  <td className="p-3"><div>{o.payment?.method || 'COD'}</div><div className="text-on-surface-variant">{o.payment?.status}</div></td>
                  <td className="p-3">
                    <select className="input-field !py-1 !text-xs" value={o.status} onChange={(e)=>update(o.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-on-surface-variant">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
