import { useEffect, useState } from 'react';
import { adminApi } from '../../services/admin';

export default function SettingsAdminPage() {
  const [form, setForm] = useState({ businessName:'', slogan:'', phone:'', whatsapp:'', email:'', address:'', currency:'DZD', socialLinksJson:'{}', contentJson:'{}' });
  const [msg, setMsg] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const s = res.data || {};
      setForm({
        businessName: s.businessName || '',
        slogan: s.slogan || '',
        phone: s.phone || '',
        whatsapp: s.whatsapp || '',
        email: s.email || '',
        address: s.address || '',
        currency: s.currency || 'DZD',
        socialLinksJson: JSON.stringify(s.socialLinks || {}, null, 2),
        contentJson: JSON.stringify(s.content || {}, null, 2),
      });
    }).catch((e)=>setError(e.message)).finally(()=>setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    try {
      let socialLinks = {}; let content = {};
      try { socialLinks = form.socialLinksJson ? JSON.parse(form.socialLinksJson) : {}; } catch { throw new Error('socialLinks must be valid JSON'); }
      try { content = form.contentJson ? JSON.parse(form.contentJson) : {}; } catch { throw new Error('content must be valid JSON'); }
      await adminApi.updateSettings({
        businessName: form.businessName, slogan: form.slogan, phone: form.phone, whatsapp: form.whatsapp,
        email: form.email || null, address: form.address, currency: form.currency, socialLinks, content,
      });
      setMsg('Settings saved.');
    } catch (e2) { setError(e2.message || 'Save failed'); }
  };

  if (loading) return <p className="text-on-surface-variant">Loading settings...</p>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Store Settings & Content</h1><p className="mt-1 text-sm text-on-surface-variant">Manage business info, socials, and site content/banners via JSON (CMS-lite for Phase 5).</p></div>
      {msg && <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="border border-light-grey bg-white p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="font-label text-xs uppercase">Business name</label><input className="input-field mt-1" value={form.businessName} onChange={(e)=>setForm(f=>({...f,businessName:e.target.value}))} /></div>
          <div><label className="font-label text-xs uppercase">Slogan</label><input className="input-field mt-1" value={form.slogan} onChange={(e)=>setForm(f=>({...f,slogan:e.target.value}))} /></div>
          <div><label className="font-label text-xs uppercase">Phone</label><input className="input-field mt-1" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} /></div>
          <div><label className="font-label text-xs uppercase">WhatsApp</label><input className="input-field mt-1" value={form.whatsapp} onChange={(e)=>setForm(f=>({...f,whatsapp:e.target.value}))} /></div>
          <div><label className="font-label text-xs uppercase">Email</label><input className="input-field mt-1" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} /></div>
          <div><label className="font-label text-xs uppercase">Currency</label><input className="input-field mt-1" value={form.currency} onChange={(e)=>setForm(f=>({...f,currency:e.target.value}))} /></div>
          <div className="sm:col-span-2"><label className="font-label text-xs uppercase">Address / Showroom</label><input className="input-field mt-1" value={form.address} onChange={(e)=>setForm(f=>({...f,address:e.target.value}))} /></div>
        </div>
        <div><label className="font-label text-xs uppercase">Social links (JSON)</label><textarea className="input-field mt-1 font-mono text-xs" rows={5} value={form.socialLinksJson} onChange={(e)=>setForm(f=>({...f,socialLinksJson:e.target.value}))} /></div>
        <div><label className="font-label text-xs uppercase">Content / Banners / Pages (JSON)</label><textarea className="input-field mt-1 font-mono text-xs" rows={10} value={form.contentJson} onChange={(e)=>setForm(f=>({...f,contentJson:e.target.value}))} /><p className="mt-1 text-xs text-on-surface-variant">Use this for banners, announcements, policy text, hero/content blocks, etc. (manageable content store).</p></div>
        <button className="btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
