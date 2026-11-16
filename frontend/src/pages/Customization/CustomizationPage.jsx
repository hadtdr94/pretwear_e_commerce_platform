import { useState } from 'react';
import { WILAYAS } from '../../data/sampleData';
import { customizationApi } from '../../services/customization';

const initial = { customerName: '', phone: '', email: '', customerType: 'INDIVIDUAL', productType: '', quantity: '', sizes: '', colors: '', technique: 'DTF printing', description: '', wilaya: WILAYAS[15] };

export default function CustomizationPage() {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSubmitted(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') fd.append(k, v); });
      files.forEach((f) => fd.append('attachments', f));
      const res = await customizationApi.create(fd);
      setSubmitted(res.data);
      setForm(initial); setFiles([]);
    } catch (err) {
      setError(err.message || 'Failed to submit customization request. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface">
      <section className="border-b border-light-grey bg-surface-container-low">
        <div className="container-shell py-12">
          <p className="section-kicker">PRETWEAR Atelier</p>
          <h1 className="section-title mt-1">Textile Personalization</h1>
          <p className="mt-3 max-w-3xl text-sm text-on-surface-variant">Professional customization services for individuals and businesses: DTF printing, embroidery, custom logos, custom T-shirts/polos/caps, professional uniforms, and event clothing. Quotation pricing is configurable by administrators (no automatic pricing).</p>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {[{ t: 'DTF Printing', d: 'High-detail color prints for complex visuals and gradients.' }, { t: 'Embroidery', d: 'Durable premium stitched branding.' }, { t: 'Custom Logos & Branding', d: 'Chest, back, sleeve and cap placements for brand identity projects.' }, { t: 'Personalized Apparel', d: 'Custom T-shirts, personalized polos, personalized caps, professional uniforms, event clothing.' }].map((s) => (
            <div key={s.t} className="border border-light-grey bg-white p-5"><h3 className="font-heading text-xl font-semibold uppercase text-primary">{s.t}</h3><p className="mt-2 text-sm text-on-surface-variant">{s.d}</p></div>
          ))}
          <div className="border border-primary bg-primary p-5 text-white"><p className="font-label text-xs uppercase tracking-label text-tertiary-fixed">Important</p><p className="mt-2 text-sm text-secondary-fixed">Requests are saved for administrator review. Administrators update statuses and send quotations (no automatic pricing).</p></div>
        </div>

        <div className="lg:col-span-7">
          <form onSubmit={onSubmit} className="border border-light-grey bg-white p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold uppercase text-primary">Submit My Project</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Fill in your customization request. Fields marked * are required.</p>
            {error && <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><label className="font-label text-xs uppercase">Customer name *</label><input name="customerName" required value={form.customerName} onChange={onChange} className="input-field mt-1" /></div>
              <div><label className="font-label text-xs uppercase">Phone number *</label><input name="phone" required value={form.phone} onChange={onChange} className="input-field mt-1" placeholder="05 / 06 / 07 ..." /></div>
              <div><label className="font-label text-xs uppercase">Email</label><input type="email" name="email" value={form.email} onChange={onChange} className="input-field mt-1" /></div>
              <div><label className="font-label text-xs uppercase">Customer type *</label><select name="customerType" value={form.customerType} onChange={onChange} className="input-field mt-1"><option value="INDIVIDUAL">Individual</option><option value="COMPANY">Company</option></select></div>
              <div><label className="font-label text-xs uppercase">Product type *</label><input name="productType" required value={form.productType} onChange={onChange} className="input-field mt-1" placeholder="T-shirt, Polo, Cap, Uniform..." /></div>
              <div><label className="font-label text-xs uppercase">Quantity *</label><input name="quantity" type="number" min="1" required value={form.quantity} onChange={onChange} className="input-field mt-1" /></div>
              <div><label className="font-label text-xs uppercase">Preferred sizes</label><input name="sizes" value={form.sizes} onChange={onChange} className="input-field mt-1" placeholder="S, M, L, XL..." /></div>
              <div><label className="font-label text-xs uppercase">Preferred colors</label><input name="colors" value={form.colors} onChange={onChange} className="input-field mt-1" placeholder="Black, White..." /></div>
              <div><label className="font-label text-xs uppercase">Customization technique *</label><select name="technique" value={form.technique} onChange={onChange} className="input-field mt-1"><option>DTF printing</option><option>Embroidery</option><option>Custom logo</option><option>Mixed / To discuss</option></select></div>
              <div><label className="font-label text-xs uppercase">Delivery wilaya *</label><select name="wilaya" value={form.wilaya} onChange={onChange} className="input-field mt-1">{WILAYAS.map((w) => <option key={w}>{w}</option>)}</select></div>
              <div className="sm:col-span-2">
                <label className="font-label text-xs uppercase">Upload logo or design (images/PDF - max 5 files, 5MB each)</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  className="input-field mt-1"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
                    e.target.value = '';
                  }}
                />
                {files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {files.map((file, idx) => {
                      const isImg = file.type?.startsWith('image/');
                      return (
                        <div key={idx} className="relative border border-light-grey rounded p-1 bg-surface-container-low w-24 flex flex-col items-center">
                          {isImg ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-16 w-full object-cover rounded"
                              onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                            />
                          ) : (
                            <div className="h-16 w-full flex items-center justify-center bg-white rounded font-label text-xs uppercase text-primary">
                              PDF
                            </div>
                          )}
                          <p className="mt-1 text-[10px] truncate max-w-full text-on-surface-variant text-center" title={file.name}>{file.name}</p>
                          <button
                            type="button"
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-700"
                            onClick={() => setFiles((f) => f.filter((_, i) => i !== idx))}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2"><label className="font-label text-xs uppercase">Description of the project *</label><textarea name="description" required value={form.description} onChange={onChange} rows={5} className="input-field mt-1" placeholder="Placement, dimensions, deadline, brand details..." /></div>
            </div>
            <button type="submit" className="btn-primary mt-6 w-full sm:w-auto" disabled={loading}>{loading ? 'Submitting...' : 'Submit My Project'}</button>
            {submitted && (
              <div className="mt-5 border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Request submitted successfully.</p>
                <p className="mt-1">Request ID: {submitted.id} • Status: {submitted.status}. Administrators can review, update status, and send quotations.</p>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
