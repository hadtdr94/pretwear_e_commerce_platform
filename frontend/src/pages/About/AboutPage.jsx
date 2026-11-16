export default function AboutPage() {
  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-surface-container-low py-12">
        <div className="container-shell">
          <p className="section-kicker">About PRETWEAR</p>
          <h1 className="section-title mt-1">Brand Identity & Services</h1>
          <p className="mt-3 max-w-3xl text-sm text-on-surface-variant">PRETWEAR — "Wear it. Brand it. Make it yours." This page presents brand identity and service capabilities only. No company history or certifications are invented.</p>
        </div>
      </section>
      <section className="container-shell grid gap-8 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="border border-light-grey bg-white p-6"><h2 className="font-heading text-2xl font-bold uppercase text-primary">Clothing</h2><p className="mt-2 text-on-surface-variant">Premium contemporary apparel designed for comfort, durability, and modern streetwear aesthetics (sample presentation).</p></div>
          <div className="border border-light-grey bg-white p-6"><h2 className="font-heading text-2xl font-bold uppercase text-primary">Textile Personalization</h2><p className="mt-2 text-on-surface-variant">Custom branding and made-to-order personalization for individuals, teams, and businesses.</p></div>
          <div className="border border-light-grey bg-white p-6"><h2 className="font-heading text-2xl font-bold uppercase text-primary">DTF Printing & Embroidery</h2><p className="mt-2 text-on-surface-variant">High-detail DTF transfers and professional embroidery techniques, including premium relief finishes where applicable.</p></div>
          <div className="border border-light-grey bg-white p-6"><h2 className="font-heading text-2xl font-bold uppercase text-primary">Professional Services</h2><p className="mt-2 text-on-surface-variant">B2B quotations, uniforms, event clothing, and bulk project support with admin-configurable workflows and pricing.</p></div>
        </div>
        <div className="space-y-4">
          <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop" alt="PRETWEAR atelier sample" className="h-72 w-full border border-light-grey object-cover" />
          <div id="legal" className="border border-light-grey bg-surface-container-low p-6">
            <h3 className="font-label text-sm uppercase tracking-label text-primary">Legal information</h3>
            <p className="mt-2 text-sm text-on-surface-variant">Legal pages and policies are configurable and will be managed via store settings/content in later phases. No legal claims or certifications are invented here.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
