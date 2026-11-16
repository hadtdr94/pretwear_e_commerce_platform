import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, MapPin, PenTool, Scissors, Shirt, Truck } from 'lucide-react';
import { catalogApi } from '../../services/catalog';
import { normalizeProduct } from '../../utils/product';
import ProductCard from '../../components/products/ProductCard';
import { TESTIMONIALS } from '../../data/sampleData';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    catalogApi.listCategories().then((res) => setCategories((res.data || []).slice(0, 6))).catch(() => setCategories([]));
    catalogApi.listProducts({ sort: 'newest', limit: 4 }).then((res) => setNewArrivals((res.data || []).map(normalizeProduct))).catch(() => setNewArrivals([]));
    catalogApi.listProducts({ featured: 'true', limit: 4 }).then((res) => {
      const list = (res.data || []).map(normalizeProduct);
      setFeatured(list.length ? list : []);
    }).catch(() => setFeatured([]));
  }, []);

  const bestSellers = featured.length ? featured : newArrivals;

  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-primary text-white">
        <div className="container-shell grid min-h-[70vh] items-stretch gap-0 lg:grid-cols-12">
          <div className="flex flex-col justify-center py-14 lg:col-span-6 lg:pr-10">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-tertiary-fixed">Haute confection & streetwear • PRETWEAR</p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Wear Your <span className="text-tertiary-fixed italic">Identity.</span>
            </motion.h1>
            <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-secondary-fixed sm:text-lg">
              Discover premium clothing and make every piece yours. Wear it. Brand it. Make it yours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/shop" className="btn-primary !border-white/20 !bg-white !text-primary hover:!bg-tertiary-fixed">Shop Collection</Link>
              <Link to="/customization" className="btn-secondary !border-white/30 !bg-transparent !text-white hover:!bg-white hover:!text-primary">Customize Your Style <ArrowRight size={16} className="ml-2" /></Link>
            </div>
            <div className="mt-10 grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
              <div className="flex gap-2"><Truck size={18} className="mt-0.5 text-tertiary-fixed" /><div><p className="font-label text-xs uppercase">58 Wilayas</p><p className="text-xs text-secondary-fixed-dim">COD delivery (configurable)</p></div></div>
              <div className="flex gap-2"><Layers size={18} className="mt-0.5 text-tertiary-fixed" /><div><p className="font-label text-xs uppercase">Premium Bases</p><p className="text-xs text-secondary-fixed-dim">Quality textiles</p></div></div>
              <div className="flex gap-2"><PenTool size={18} className="mt-0.5 text-tertiary-fixed" /><div><p className="font-label text-xs uppercase">DTF & Embroidery</p><p className="text-xs text-secondary-fixed-dim">Atelier personalization</p></div></div>
            </div>
          </div>
          <div className="relative min-h-[320px] lg:col-span-6">
            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop" alt="PRETWEAR editorial" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent lg:bg-gradient-to-r" />
            <div className="absolute right-4 top-4 border border-white/20 bg-white/90 px-3 py-1 font-label text-[11px] uppercase tracking-label text-primary">Bordj El Kiffan, Alger</div>
          </div>
        </div>
      </section>

      <section className="border-b border-light-grey bg-surface-container-high py-3">
        <div className="container-shell flex flex-wrap items-center gap-x-6 gap-y-1 font-label text-xs uppercase tracking-[0.18em] text-primary">
          <span>Heavyweight cotton bases</span><span className="text-outline">•</span><span>DTF & 3D embroidery</span><span className="text-outline">•</span><span>COD across 58 wilayas</span><span className="text-outline">•</span><span>B2B quotes & bulk orders</span>
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div><p className="section-kicker">Répertoire textile</p><h2 className="section-title mt-1">Featured Categories</h2></div>
          <p className="max-w-md text-sm text-on-surface-variant">Neutral bases and ready-to-customize pieces. Sample/demo catalog data in development.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} className="group relative overflow-hidden border border-light-grey bg-white">
              <img src={cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop'} alt={cat.name} className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-heading text-xl font-bold uppercase">{cat.name}</h3>
                <span className="mt-1 inline-flex items-center font-label text-xs uppercase tracking-label text-tertiary-fixed">Explore <ArrowRight size={14} className="ml-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-light-grey bg-surface-container-low py-14">
        <div className="container-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div><p className="section-kicker">Drop</p><h2 className="section-title mt-1">New Arrivals</h2></div>
            <Link to="/shop?sort=newest" className="font-label text-xs font-semibold uppercase tracking-label text-primary underline underline-offset-4">View all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="bg-primary py-14 text-white">
        <div className="container-shell grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-tertiary-fixed">Atelier de personnalisation</p>
            <h2 className="mt-2 font-heading text-4xl font-bold uppercase tracking-tight">PRETWEAR Customization</h2>
            <p className="mt-4 max-w-2xl text-secondary-fixed">DTF printing, embroidery, custom logos, and personalized clothing for individuals and teams. Quotation pricing is configurable by administrators (no automatic pricing).</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {['DTF printing', 'Embroidery', 'Custom logos', 'Personalized clothing'].map((s) => (<div key={s} className="border border-white/15 bg-white/5 p-4"><p className="font-label text-sm uppercase tracking-label">{s}</p></div>))}
            </div>
            <Link to="/customization" className="btn-accent mt-8">Create Your Design</Link>
          </div>
          <div className="lg:col-span-5">
            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop" alt="Textile customization atelier" className="h-full min-h-[320px] w-full border border-white/10 object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="section-kicker">Selection</p><h2 className="section-title mt-1">Featured / Best Sellers</h2></div>
          <Link to="/shop" className="font-label text-xs font-semibold uppercase tracking-label text-primary underline underline-offset-4">Shop all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="border-y border-light-grey bg-surface-container-low py-14">
        <div className="container-shell grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="section-kicker">Professional Solutions</p>
            <h2 className="mt-2 font-heading text-4xl font-bold uppercase tracking-tight text-primary">Your Brand. Our Textile Expertise.</h2>
            <p className="mt-4 max-w-2xl text-on-surface-variant">For companies, agencies, restaurants, hotels, associations, and event organizers. Configurable quotation workflow and bulk production support.</p>
            <div className="mt-6 flex flex-wrap gap-2">{['Companies', 'Agencies', 'Restaurants', 'Hotels', 'Associations', 'Event Organizers'].map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <Link to="/b2b" className="btn-primary mt-8">Request a Quote</Link>
          </div>
          <div className="border border-light-grey bg-white p-6 lg:col-span-5">
            <div className="flex items-start gap-3"><Scissors className="mt-1 text-accent" /><div><p className="font-label text-sm uppercase">Custom Production</p><p className="text-sm text-on-surface-variant">From single pieces to bulk series (admin-configured quotations).</p></div></div>
            <div className="mt-4 flex items-start gap-3"><Shirt className="mt-1 text-accent" /><div><p className="font-label text-sm uppercase">Professional Garments</p><p className="text-sm text-on-surface-variant">Polos, tees, caps, uniforms and event clothing bases.</p></div></div>
            <div className="mt-4 flex items-start gap-3"><MapPin className="mt-1 text-accent" /><div><p className="font-label text-sm uppercase">Algeria Delivery</p><p className="text-sm text-on-surface-variant">Configurable delivery zones across 58 wilayas.</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-light-grey bg-surface-container-low py-14">
        <div className="container-shell">
          <p className="section-kicker">Customer Testimonials (Sample)</p>
          <h2 className="section-title mt-2">Trusted Experience</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border border-light-grey bg-white p-5">
                <p className="font-label text-xs uppercase tracking-label text-accent">{'★'.repeat(t.rating)}</p>
                <p className="mt-3 text-sm italic text-on-surface">"{t.text}"</p>
                <div className="mt-4 border-t border-light-grey pt-3 text-sm"><p className="font-semibold text-primary">{t.name}</p><p className="text-on-surface-variant">{t.location}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
