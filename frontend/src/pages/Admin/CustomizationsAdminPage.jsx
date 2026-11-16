import { useEffect, useState } from 'react';
import { adminApi } from '../../services/admin';
import { formatDZD } from '../../utils/format';
import { Eye, FileText, Download, X } from 'lucide-react';

const STATUSES = ['PENDING','REVIEWING','QUOTED','APPROVED','IN_PRODUCTION','COMPLETED','REJECTED','CANCELLED'];

function isImage(attachment) {
  const mime = (attachment.mimeType || '').toLowerCase();
  const name = (attachment.originalName || attachment.filename || '').toLowerCase();
  return mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function CustomizationsAdminPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [quoteForm, setQuoteForm] = useState({}); // id -> {amount,note}
  const [modalImage, setModalImage] = useState(null); // { url, title, size }

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminApi.listCustomizations({ ...(status ? { status } : {}), limit: 50 });
      setItems(res.data || []);
    } catch (e) { setError(e.message || 'Failed to load requests'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id, newStatus, adminNotes) => {
    setMsg(''); setError('');
    try { await adminApi.updateCustomizationStatus(id, { status: newStatus, ...(adminNotes ? { adminNotes } : {}) }); setMsg('Status updated.'); await load(); }
    catch (e) { setError(e.message || 'Update failed'); }
  };

  const sendQuote = async (id) => {
    const f = quoteForm[id] || {};
    if (!f.amount) return setError('Quote amount required');
    setMsg(''); setError('');
    try { await adminApi.addQuote(id, { amount: Number(f.amount), note: f.note || undefined, currency: 'DZD' }); setMsg('Quote added.'); setQuoteForm((p)=>({ ...p, [id]: { amount:'', note:'' } })); await load(); }
    catch (e) { setError(e.message || 'Failed to add quote'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="section-kicker">Admin</p><h1 className="section-title mt-1">Customization Requests</h1></div>
        <select className="input-field !w-auto !py-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {msg && <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? <p className="text-sm text-on-surface-variant">Loading...</p> : items.length === 0 ? <p className="text-sm text-on-surface-variant">No requests found.</p> : (
        <div className="space-y-4">
          {items.map((r) => (
            <div key={r.id} className="border border-light-grey bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-label font-semibold text-primary">{r.customerName} <span className="text-on-surface-variant font-normal">({r.customerType})</span></p>
                  <p className="text-sm text-on-surface-variant">{r.phone} {r.email ? `• ${r.email}` : ''} • {r.wilaya}</p>
                  <p className="mt-1 text-sm"><strong>Product:</strong> {r.productType} • <strong>Qty:</strong> {r.quantity} • <strong>Technique:</strong> {r.technique}</p>
                  <p className="text-sm text-on-surface-variant">Sizes: {r.sizes || '—'} • Colors: {r.colors || '—'}</p>
                </div>
                <div className="text-right">
                  <select className="input-field !py-1 !text-xs" value={r.status} onChange={(e)=>updateStatus(r.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-on-surface-variant">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap"><strong>Description:</strong> {r.description}</p>
              {r.adminNotes && <p className="mt-2 text-sm text-on-surface-variant"><strong>Admin notes:</strong> {r.adminNotes}</p>}

              {/* Attachments & Design Artwork Gallery */}
              {(r.attachments || []).length > 0 && (
                <div className="mt-4 border-t border-light-grey/60 pt-3">
                  <p className="font-label text-xs uppercase tracking-label text-on-surface-variant font-semibold mb-2">
                    Customer Uploaded Artwork ({r.attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {r.attachments.map((a) => {
                      const image = isImage(a);
                      return image ? (
                        <div key={a.id} className="group relative border border-light-grey rounded overflow-hidden bg-surface-container-low w-32 flex flex-col">
                          <div
                            className="h-28 w-full cursor-pointer overflow-hidden bg-white flex items-center justify-center relative"
                            onClick={() => setModalImage({ url: a.url, title: a.originalName, size: formatBytes(a.size) })}
                          >
                            <img
                              src={a.url}
                              alt={a.originalName}
                              className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/128x128?text=Image+Load+Error';
                              }}
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye size={20} className="drop-shadow" />
                            </div>
                          </div>
                          <div className="p-1.5 bg-white border-t border-light-grey/60 text-[11px] truncate flex items-center justify-between">
                            <span className="truncate max-w-[80px]" title={a.originalName}>{a.originalName}</span>
                            <a
                              href={a.url}
                              download={a.originalName}
                              target="_blank"
                              rel="noreferrer"
                              title="Download original file"
                              className="text-on-surface-variant hover:text-primary ml-1"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div key={a.id} className="border border-light-grey rounded p-2.5 bg-surface-container-low flex items-center gap-2 max-w-xs">
                          <FileText size={24} className="text-primary shrink-0" />
                          <div className="text-xs truncate">
                            <p className="font-medium truncate" title={a.originalName}>{a.originalName}</p>
                            <p className="text-[10px] text-on-surface-variant">{formatBytes(a.size)}</p>
                          </div>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto p-1 text-primary hover:underline text-xs"
                          >
                            Open
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(r.quotes || []).length > 0 && (
                <div className="mt-3 text-sm"><strong>Quotes:</strong> {r.quotes.map((q) => <span key={q.id} className="ml-2 chip">{formatDZD(q.amount)} {q.note ? `— ${q.note}` : ''}</span>)}</div>
              )}
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-light-grey pt-3">
                <input className="input-field !w-40 !py-2" type="number" placeholder="Quote amount (DZD)" value={quoteForm[r.id]?.amount || ''} onChange={(e)=>setQuoteForm(p=>({ ...p, [r.id]: { ...(p[r.id]||{}), amount: e.target.value } }))} />
                <input className="input-field !w-64 !py-2" placeholder="Quote note (optional)" value={quoteForm[r.id]?.note || ''} onChange={(e)=>setQuoteForm(p=>({ ...p, [r.id]: { ...(p[r.id]||{}), note: e.target.value } }))} />
                <button className="btn-secondary !py-2" onClick={()=>sendQuote(r.id)}>Add Quote</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white p-2 rounded shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-light-grey pb-2 mb-2 px-2">
              <div className="text-sm font-semibold truncate pr-4">
                {modalImage.title} {modalImage.size && <span className="text-on-surface-variant font-normal">({modalImage.size})</span>}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={modalImage.url}
                  download={modalImage.title}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary !py-1 !px-2 text-xs flex items-center gap-1"
                >
                  <Download size={14} /> Download
                </a>
                <button
                  type="button"
                  className="p-1 hover:bg-surface-container rounded"
                  onClick={() => setModalImage(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-auto flex items-center justify-center max-h-[75vh]">
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
