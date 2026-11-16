import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const mapQuery = encodeURIComponent('Bordj El Kiffan, Algiers, Algeria');
  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-surface-container-low py-12">
        <div className="container-shell">
          <p className="section-kicker">Contact</p>
          <h1 className="section-title mt-1">Get in Touch</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Showroom: Bordj El Kiffan, Algiers, Algeria. Contact channels are configurable in store settings.</p>
        </div>
      </section>
      <section className="container-shell grid gap-8 py-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="border border-light-grey bg-white p-5"><p className="font-label text-xs uppercase text-on-surface-variant">Phone</p><p className="mt-1 font-semibold text-primary">+213 (0) XX XX XX XX (configurable)</p></div>
          <div className="border border-light-grey bg-white p-5"><p className="font-label text-xs uppercase text-on-surface-variant">WhatsApp</p><a className="mt-1 inline-block font-semibold text-primary underline" href="https://wa.me/" target="_blank" rel="noreferrer">Open WhatsApp (configurable)</a></div>
          <div className="border border-light-grey bg-white p-5"><p className="font-label text-xs uppercase text-on-surface-variant">Email</p><p className="mt-1 font-semibold text-primary">contact@pretwear.dz (configurable)</p></div>
          <div className="border border-light-grey bg-white p-5"><p className="font-label text-xs uppercase text-on-surface-variant">Social media</p><div className="mt-2 flex flex-wrap gap-3 text-sm"><a className="underline" href="https://www.tiktok.com/@pretwear" target="_blank" rel="noreferrer">TikTok</a><a className="underline" href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a></div></div>
          <div id="delivery" className="border border-light-grey bg-surface-container-low p-5"><h3 className="font-label text-sm uppercase text-primary">Delivery information</h3><p className="mt-2 text-sm text-on-surface-variant">Delivery across 58 Algerian wilayas via configurable delivery zones and fees. COD supported.</p></div>
          <div id="returns" className="border border-light-grey bg-surface-container-low p-5"><h3 className="font-label text-sm uppercase text-primary">Returns policy</h3><p className="mt-2 text-sm text-on-surface-variant">Returns/exchange policy content is configurable in store settings (to be finalized with actual business policy).</p></div>
        </div>
        <div className="space-y-6 lg:col-span-7">
          <form className="border border-light-grey bg-white p-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <h2 className="font-heading text-2xl font-bold uppercase text-primary">Contact Form</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input required className="input-field" placeholder="Full name *" />
              <input required className="input-field" placeholder="Phone / Email *" />
              <input className="input-field sm:col-span-2" placeholder="Subject" />
              <textarea required rows={5} className="input-field sm:col-span-2" placeholder="Message *" />
            </div>
            <button type="submit" className="btn-primary mt-4">Send Message</button>
            {sent && <p className="mt-3 border border-green-200 bg-green-50 p-3 text-sm text-green-800">Message captured (Phase 2 UI). Backend/contact handling can be integrated in later phases.</p>}
          </form>
          <div className="border border-light-grey bg-white p-2">
            <iframe title="PRETWEAR Showroom Map" className="h-[340px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} />
            <p className="p-2 text-xs text-on-surface-variant">Google Maps integration (configurable location): Bordj El Kiffan, Algiers, Algeria.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
