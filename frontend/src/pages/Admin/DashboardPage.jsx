import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/admin';
import { formatDZD } from '../../utils/format';
import { RefreshCw, CheckCircle2, Clock, Truck, AlertCircle, ShoppingBag, Users, Scissors } from 'lucide-react';

function statusBadge(status) {
  switch (status) {
    case 'DELIVERED':
      return 'border-green-200 bg-green-50 text-green-800';
    case 'SHIPPED':
    case 'PROCESSING':
    case 'CONFIRMED':
      return 'border-blue-200 bg-blue-50 text-blue-800';
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'CANCELLED':
      return 'border-red-200 bg-red-50 text-red-800';
    default:
      return 'border-light-grey bg-surface-container text-primary';
  }
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.dashboard();
      setData(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (!data) return <div className="text-on-surface-variant">Loading dashboard...</div>;

  const m = data.metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker">Admin</p>
          <h1 className="section-title mt-1">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="btn-secondary !py-2 flex items-center gap-2 self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Financial Overview (Delivered vs In-Transit vs Total) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-green-200 bg-green-50/50 p-5 rounded">
          <div className="flex items-center justify-between">
            <p className="font-label text-xs uppercase tracking-label text-green-900 font-semibold">Delivered Revenue (Encaissé)</p>
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <p className="mt-2 font-heading text-3xl font-extrabold text-green-950">
            {formatDZD(m.deliveredRevenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-green-800">
            {m.deliveredOrders ?? 0} order(s) successfully delivered & paid
          </p>
        </div>

        <div className="border border-amber-200 bg-amber-50/50 p-5 rounded">
          <div className="flex items-center justify-between">
            <p className="font-label text-xs uppercase tracking-label text-amber-900 font-semibold">Pending / In Delivery</p>
            <Truck size={18} className="text-amber-600" />
          </div>
          <p className="mt-2 font-heading text-3xl font-extrabold text-amber-950">
            {formatDZD(m.pendingRevenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-amber-800">
            {(m.pendingOrders ?? 0) + (m.processingOrders ?? 0)} order(s) awaiting delivery / COD collection
          </p>
        </div>

        <div className="border border-light-grey bg-white p-5 rounded">
          <div className="flex items-center justify-between">
            <p className="font-label text-xs uppercase tracking-label text-on-surface-variant font-semibold">Total Order Pipeline</p>
            <ShoppingBag size={18} className="text-primary" />
          </div>
          <p className="mt-2 font-heading text-3xl font-extrabold text-primary">
            {formatDZD(m.totalRevenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {m.orders ?? 0} total active orders
          </p>
        </div>
      </div>

      {/* Operational Breakdown Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="border border-light-grey bg-white p-4">
          <p className="font-label text-[11px] uppercase tracking-label text-on-surface-variant">Delivered Orders</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading text-2xl font-bold text-green-700">{m.deliveredOrders ?? 0}</span>
            <span className="chip !text-[10px] !bg-green-100 !text-green-800 !border-green-300">Completed</span>
          </div>
        </div>

        <div className="border border-light-grey bg-white p-4">
          <p className="font-label text-[11px] uppercase tracking-label text-on-surface-variant">In Transit / Processing</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading text-2xl font-bold text-blue-700">{m.processingOrders ?? 0}</span>
            <span className="chip !text-[10px] !bg-blue-100 !text-blue-800 !border-blue-300">Shipping</span>
          </div>
        </div>

        <div className="border border-light-grey bg-white p-4">
          <p className="font-label text-[11px] uppercase tracking-label text-on-surface-variant">Pending Orders</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading text-2xl font-bold text-amber-700">{m.pendingOrders ?? 0}</span>
            <span className="chip !text-[10px] !bg-amber-100 !text-amber-800 !border-amber-300">To Confirm</span>
          </div>
        </div>

        <div className="border border-light-grey bg-white p-4">
          <p className="font-label text-[11px] uppercase tracking-label text-on-surface-variant">Customizations</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading text-2xl font-bold text-primary">{m.pendingCustomizations ?? 0}</span>
            <span className="chip !text-[10px]">Requests</span>
          </div>
        </div>

        <div className="border border-light-grey bg-white p-4">
          <p className="font-label text-[11px] uppercase tracking-label text-on-surface-variant">Catalog Products</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading text-2xl font-bold text-primary">{m.products ?? 0}</span>
            <span className="text-xs text-on-surface-variant">{m.customers ?? 0} users</span>
          </div>
        </div>
      </div>

      {/* Recent Orders & Stock Alerts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="border border-light-grey bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-bold uppercase text-primary">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-primary underline">
              View All Orders →
            </Link>
          </div>
          <div className="space-y-2">
            {(data.recentOrders || []).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No orders yet.</p>
            ) : (
              data.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border border-light-grey p-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-label font-semibold text-primary">{o.reference}</p>
                      <span className={`chip !text-[10px] !py-0.5 ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {o.customerName} • {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-label font-semibold">{formatDZD(o.total)}</p>
                    <p className="text-[11px] text-on-surface-variant">{o.payment?.method || 'COD'} • {o.payment?.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border border-light-grey bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-bold uppercase text-primary">Low Stock Alerts</h2>
            <Link to="/admin/products" className="text-xs font-semibold text-primary underline">
              Manage Stock →
            </Link>
          </div>
          <div className="space-y-2">
            {(data.lowStock || []).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No low stock items.</p>
            ) : (
              data.lowStock.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border border-light-grey p-3 text-sm">
                  <div>
                    <p className="font-semibold text-primary">{inv.variant?.product?.name || 'Product'}</p>
                    <p className="text-on-surface-variant text-xs">{inv.variant?.sku} • {[inv.variant?.color?.name, inv.variant?.size?.name].filter(Boolean).join(' / ')}</p>
                  </div>
                  <span className="chip !border-red-200 !bg-red-50 !text-red-700">{inv.quantity} left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
