import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
  { to: '/customization', label: 'Customization' },
  { to: '/b2b', label: 'B2B' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-light-grey/70 bg-white/95 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-heading text-xl font-extrabold uppercase tracking-tight text-primary">PRETWEAR</span>
          <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Atelier & Streetwear</span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-label text-xs font-semibold uppercase tracking-label transition-colors ${
                  isActive ? 'text-primary underline decoration-2 underline-offset-8' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/shop" aria-label="Search" className="inline-flex h-10 w-10 items-center justify-center text-primary hover:bg-surface-container-low">
            <Search size={20} />
          </Link>
          <Link to="/account" aria-label="Account" className="inline-flex h-10 w-10 items-center justify-center text-primary hover:bg-surface-container-low">
            <User size={20} />
          </Link>
          <Link to="/cart" aria-label="Shopping bag" className="relative inline-flex h-10 w-10 items-center justify-center text-primary hover:bg-surface-container-low">
            <ShoppingBag size={20} />
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-primary px-1 font-label text-[10px] font-bold text-white">{count}</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-primary hover:bg-surface-container-low xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-light-grey bg-white xl:hidden">
          <nav className="container-shell grid gap-1 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-2 py-2 font-label text-xs font-semibold uppercase tracking-label ${
                    isActive ? 'bg-surface-container text-primary' : 'text-on-surface-variant'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
