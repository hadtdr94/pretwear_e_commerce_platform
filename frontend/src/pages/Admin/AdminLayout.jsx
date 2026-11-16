import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Scissors, Users, Truck, Settings, Tags, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customizations', label: 'Customizations', icon: Scissors },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/delivery-zones', label: 'Delivery Zones', icon: Truck },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 border-r border-light-grey bg-primary text-white hidden lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-5">
            <p className="font-heading text-xl font-extrabold uppercase">PRETWEAR</p>
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-tertiary-fixed">Administration</p>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 font-label text-xs uppercase tracking-label ${isActive ? 'bg-white text-primary' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4 text-xs">
            <p className="font-semibold">{user?.email}</p>
            <p className="text-white/70 uppercase">{user?.role}</p>
            <div className="mt-3 flex gap-2">
              <Link to="/" className="btn-secondary !px-3 !py-1.5 !text-[10px] !border-white/30 !bg-transparent !text-white hover:!bg-white hover:!text-primary"><Store size={12} className="mr-1"/>Store</Link>
              <button type="button" onClick={logout} className="btn-secondary !px-3 !py-1.5 !text-[10px]">Logout</button>
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 border-b border-light-grey bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
              <div className="flex items-center gap-3 overflow-x-auto lg:hidden">
                {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({isActive})=>`whitespace-nowrap border px-2 py-1 font-label text-[10px] uppercase ${isActive?'border-primary bg-primary text-white':'border-light-grey'}`}>{item.label}</NavLink>)}
              </div>
              <div className="hidden lg:block font-label text-xs uppercase tracking-label text-on-surface-variant">PRETWEAR Admin — RBAC {user?.role}</div>
              <div className="flex items-center gap-2 lg:hidden">
                <Link to="/" className="text-xs underline">Store</Link>
                <button type="button" onClick={logout} className="text-xs underline">Logout</button>
              </div>
            </div>
          </header>
          <main className="p-4 lg:p-8"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
