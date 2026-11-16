import { useState } from 'react';
import { WILAYAS } from '../../data/sampleData';

export default function B2BPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-primary py-14 text-white">
        <div className="container-shell">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-tertiary-fixed">Professional / B2B</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">Your Brand. Our Textile Expertise.</h1>
          <p className="mt-4 max-w-3xl text-secondary-fixed">Dedicated textile and personalization solutions for companies, brands, agencies, restaurants, hotels, events, and associations. Sample content only — no invented history or certifications.</p>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-12 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Companies & Brands', 'Uniforms, merch, and branded apparel programs.'],
              ['Agencies & Events', 'Campaign, festival, and event clothing production.'],
              ['Restaurants & Hotels', 'Polos, aprons, caps and hospitality-ready garments.'],
              ['Associations', 'Teamwear and community merchandising projects.'],
            ].map(([t, d]) => (
              <div key={t} className="border border-light-grey bg-white p-5"><h3 className="font-heading text-lg font-semibold uppercase text-primary">{t}</h3><p className="mt-2 text-sm text-on-surface-variant">{d}</p></div>
            ))}
          </div>
          <div className="border border-light-grey bg-white p-6">
            <h2 className="font-heading text-2xl font-bold uppercase text-primary">Customization Process</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Brief & requirements', 'Technique & garment selection', 'Quotation (admin-configured)', 'Production & delivery'].map((s, i) => (
                <li key={s} className="flex gap-3 border border-light-grey bg-surface-container-low p-3"><span className="font-label font-bold text-accent">0{i + 1}</span><span className="text-sm text-primary">{s}</span></li>
              ))}
            </ol>
          </div>
          <div className="border border-light-grey bg-white p-6">
            <h2 className="font-heading text-2xl font-bold uppercase text-primary">Professional Product Gallery (Sample)</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {['1556821840-3a63f95609a7','1521572163474-6864f9cf17ab','1586363104862-3a5e2ab60d99','1588850561407-ed78c282e89b','1591047139829-d91aecb6caea','1503342217505-b0a15ec3261c'].map((id) => (
                <img key={id} src={`https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`} alt="B2B sample" className="h-36 w-full border border-light-grey object-cover" loading="lazy" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <form className="border border-light-grey bg-white p-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <h2 className="font-heading text-2xl font-bold uppercase text-primary">Request a Quote</h2>
            <p className="mt-1 text-sm text-on-surface-variant">B2B quotation form (UI). Saved to database and managed in admin in later phases.</p>
            <div className="mt-5 grid gap-3">
              <input required className="input-field" placeholder="Company / Organization name *" />
              <input required className="input-field" placeholder="Contact person *" />
              <input required className="input-field" placeholder="Phone number *" />
              <input type="email" className="input-field" placeholder="Email" />
              <input required className="input-field" placeholder="Product types (tees, polos, caps...) *" />
              <input required className="input-field" placeholder="Estimated quantity *" />
              <select className="input-field" defaultValue={WILAYAS[15]}>{WILAYAS.map((w) => <option key={w}>{w}</option>)}</select>
              <textarea rows={4} required className="input-field" placeholder="Project details, techniques, deadline... *" />
              <button type="submit" className="btn-primary w-full">Request a Quote</button>
              {submitted && <p className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">Quote request captured (Phase 2 UI). Admin quotation workflow will be connected in Phase 3–5.</p>}
            </div>
            <div className="mt-6 border-t border-light-grey pt-4 text-sm text-on-surface-variant">
              <p><strong className="text-primary">Showroom:</strong> Bordj El Kiffan, Algiers, Algeria</p>
              <p><strong className="text-primary">WhatsApp/Phone/Email:</strong> configurable in settings</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
