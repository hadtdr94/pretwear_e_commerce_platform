import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-shell grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <span className="font-heading text-2xl font-extrabold uppercase tracking-tight">PRETWEAR</span>
            <span className="border border-tertiary-fixed/40 bg-tertiary-container px-2 py-0.5 font-label text-[10px] uppercase tracking-[0.14em] text-tertiary-fixed">Atelier</span>
          </div>
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-secondary-fixed-dim">
            Wear it. Brand it. Make it yours. Premium clothing and textile personalization for individuals and professionals in Algeria.
          </p>
          <div className="mt-4 space-y-1 font-body text-sm text-secondary-fixed-dim">
            <p>Bordj El Kiffan, Algiers, Algeria</p>
            <p>Showroom location configurable in admin settings (Phase 5)</p>
            <p>Cash on delivery (COD) workflows supported</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-label text-xs font-semibold uppercase tracking-label text-tertiary-fixed">Shop</h3>
          <div className="mt-3 grid gap-2 text-sm text-secondary-fixed">
            <Link to="/shop" className="hover:text-white">All Products</Link>
            <Link to="/collections" className="hover:text-white">Collections</Link>
            <Link to="/customization" className="hover:text-white">Customization</Link>
            <Link to="/b2b" className="hover:text-white">B2B & Quotes</Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-label text-xs font-semibold uppercase tracking-label text-tertiary-fixed">Company</h3>
          <div className="mt-3 grid gap-2 text-sm text-secondary-fixed">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/account" className="hover:text-white">My Account</Link>
            <Link to="/cart" className="hover:text-white">Shopping Bag</Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-label text-xs font-semibold uppercase tracking-label text-tertiary-fixed">Policies</h3>
          <div className="mt-3 grid gap-2 text-sm text-secondary-fixed">
            <Link to="/contact#delivery" className="hover:text-white">Delivery Information</Link>
            <Link to="/contact#returns" className="hover:text-white">Returns Policy</Link>
            <Link to="/about#legal" className="hover:text-white">Legal Information</Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-label text-xs font-semibold uppercase tracking-label text-tertiary-fixed">Social</h3>
          <div className="mt-3 grid gap-2 text-sm text-secondary-fixed">
            <a href="https://www.tiktok.com/@pretwear" target="_blank" rel="noreferrer" className="hover:text-white">TikTok</a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">Instagram (configurable)</a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp (configurable)</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-2 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PRETWEAR. All rights reserved. Sample/demo UI content in development.</p>
          <p>Prices displayed in DZD/DA.</p>
        </div>
      </div>
    </footer>
  );
}
