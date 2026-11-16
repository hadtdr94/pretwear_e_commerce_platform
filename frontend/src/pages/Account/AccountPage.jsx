import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../services/orders';
import { customizationApi } from '../../services/customization';
import { formatDZD } from '../../utils/format';

function TabButton({ active, children, onClick }) {
  return <button type="button" onClick={onClick} className={`border px-4 py-2 font-label text-xs uppercase tracking-label ${active ? 'border-primary bg-primary text-white' : 'border-light-grey bg-white text-primary'}`}>{children}</button>;
}

export default function AccountPage() {
  const { user, loading, isAuthenticated, login, register, logout } = useAuth();
  const [tab, setTab] = useState('auth');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [orders, setOrders] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });

  useEffect(() => { if (isAuthenticated) setTab('orders'); }, [isAuthenticated]);
  useEffect(() => {
    if (isAuthenticated && tab === 'orders') {
      ordersApi.mine()
        .then((res) => setOrders(Array.isArray(res?.data) ? res.data : []))
        .catch(() => setOrders([]));
    }
    if (isAuthenticated && tab === 'customizations') {
      customizationApi.mine()
        .then((res) => setCustomizations(Array.isArray(res?.data) ? res.data : []))
        .catch(() => setCustomizations([]));
    }
  }, [isAuthenticated, tab]);

  const onLogin = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try { await login(loginForm); setMsg('Logged in successfully.'); } catch (e2) { setErr(e2?.message || 'Login failed'); }
  };
  const onRegister = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const payload = {
        email: (regForm.email || '').trim(),
        password: regForm.password || '',
        firstName: (regForm.firstName || '').trim() || undefined,
        lastName: (regForm.lastName || '').trim() || undefined,
        phone: (regForm.phone || '').trim() || undefined,
      };
      await register(payload);
      setMsg('Account created and logged in.');
    } catch (e2) {
      setErr(e2?.message || 'Registration failed');
    }
  };
  const onLogout = async () => { await logout(); setOrders([]); setTab('auth'); setMsg('Logged out.'); };

  return (
    <div className="bg-surface">
      <section className="container-shell py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="section-kicker">Customer Account</p><h1 className="section-title mt-1">Account</h1></div>
          {isAuthenticated && <button type="button" className="btn-secondary !py-2" onClick={onLogout}>Logout</button>}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <TabButton active={tab==='auth'} onClick={() => setTab('auth')}>{isAuthenticated ? 'Profile' : 'Login / Register'}</TabButton>
          <TabButton active={tab==='orders'} onClick={() => setTab('orders')}>Order History</TabButton>
          <TabButton active={tab==='customizations'} onClick={() => setTab('customizations')}>Customization Projects</TabButton>
          <TabButton active={tab==='favorites'} onClick={() => setTab('favorites')}>Favorites</TabButton>
        </div>

        {msg && <div className="mt-4 border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
        {err && <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

        {tab === 'auth' && !isAuthenticated && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form className="border border-light-grey bg-white p-6" onSubmit={onLogin}>
              <h2 className="font-heading text-xl font-bold uppercase text-primary">Login</h2>
              <div className="mt-4 grid gap-3">
                <input required type="email" className="input-field" placeholder="Email" value={loginForm.email} onChange={(e)=>setLoginForm(f=>({...f,email:e.target.value}))} />
                <input required type="password" className="input-field" placeholder="Password" value={loginForm.password} onChange={(e)=>setLoginForm(f=>({...f,password:e.target.value}))} />
                <button className="btn-primary" disabled={loading}>Login</button>
                <p className="text-xs text-on-surface-variant">Sample: admin@pretwear.demo / manager@pretwear.demo / customer@pretwear.demo (Password123!) after seeding.</p>
              </div>
            </form>
            <form className="border border-light-grey bg-white p-6" onSubmit={onRegister}>
              <h2 className="font-heading text-xl font-bold uppercase text-primary">Register</h2>
              <div className="mt-4 grid gap-3">
                <div className="grid grid-cols-2 gap-3"><input className="input-field" placeholder="First name" value={regForm.firstName} onChange={(e)=>setRegForm(f=>({...f,firstName:e.target.value}))} /><input className="input-field" placeholder="Last name" value={regForm.lastName} onChange={(e)=>setRegForm(f=>({...f,lastName:e.target.value}))} /></div>
                <input required type="email" className="input-field" placeholder="Email" value={regForm.email} onChange={(e)=>setRegForm(f=>({...f,email:e.target.value}))} />
                <input className="input-field" placeholder="Phone" value={regForm.phone} onChange={(e)=>setRegForm(f=>({...f,phone:e.target.value}))} />
                <input required type="password" minLength={6} className="input-field" placeholder="Password (min 6)" value={regForm.password} onChange={(e)=>setRegForm(f=>({...f,password:e.target.value}))} />
                <button className="btn-secondary">Create Account</button>
              </div>
            </form>
          </div>
        )}

        {tab === 'auth' && isAuthenticated && (
          <div className="mt-6 border border-light-grey bg-white p-6">
            <h2 className="font-heading text-xl font-bold uppercase text-primary">Profile</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <p><strong>Name:</strong> {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'}</p>
              <p><strong>Email:</strong> {user?.email || '—'}</p>
              <p><strong>Phone:</strong> {user?.phone || '—'}</p>
              <p><strong>Role:</strong> {user?.role || 'CUSTOMER'}</p>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant">Address/profile editing and favorites management can be expanded in a later iteration; core auth and order history are integrated.</p>
          </div>
        )}

        {tab === 'orders' && (
          <div className="mt-6 border border-light-grey bg-white p-6">
            <h2 className="font-heading text-xl font-bold uppercase text-primary">Order History</h2>
            {!isAuthenticated ? (
              <p className="mt-3 text-sm text-on-surface-variant">Please log in to view your orders.</p>
            ) : (!Array.isArray(orders) || orders.length === 0) ? (
              <div className="mt-4 border border-dashed border-light-grey p-8 text-center text-sm text-on-surface-variant">No orders yet. <Link to="/shop" className="underline text-primary">Start shopping</Link>.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {(Array.isArray(orders) ? orders : []).map((o) => (
                  <div key={o.id} className="border border-light-grey p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-label font-semibold text-primary">{o.reference}</p>
                      <span className="chip">{o.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">{new Date(o.createdAt).toLocaleString()} • {o.items?.length || 0} item(s) • Total: <strong className="text-primary">{formatDZD(o.total)}</strong></p>
                    <p className="text-xs text-on-surface-variant mt-1">Delivery: {o.wilaya}, {o.commune} — {o.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'customizations' && (
          <div className="mt-6 border border-light-grey bg-white p-6">
            <h2 className="font-heading text-xl font-bold uppercase text-primary">Customization Projects</h2>
            {!isAuthenticated ? (
              <p className="mt-3 text-sm text-on-surface-variant">Please log in to view your projects.</p>
            ) : (!Array.isArray(customizations) || customizations.length === 0) ? (
              <div className="mt-4 border border-dashed border-light-grey p-8 text-center text-sm text-on-surface-variant">
                No customization projects submitted yet. <Link to="/customization" className="underline text-primary">Start a project</Link>.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {customizations.map((c) => (
                  <div key={c.id} className="border border-light-grey p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-label font-semibold text-primary">{c.productType} ({c.technique})</p>
                      <span className="chip">{c.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Qty: {c.quantity} • Wilaya: {c.wilaya} • Submitted: {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{c.description}</p>

                    {(c.attachments || []).length > 0 && (
                      <div className="mt-3 border-t border-light-grey/60 pt-2">
                        <p className="text-xs font-semibold uppercase font-label text-on-surface-variant mb-1">Attached Artwork:</p>
                        <div className="flex flex-wrap gap-2">
                          {c.attachments.map((a) => (
                            <a
                              key={a.id}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="border border-light-grey rounded overflow-hidden h-14 w-14 bg-surface-container-low flex items-center justify-center hover:opacity-80 transition-opacity"
                              title={a.originalName}
                            >
                              {/\.(png|jpe?g|webp|gif|svg)$/i.test(a.originalName || a.filename || '') ? (
                                <img src={a.url} alt={a.originalName} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-primary uppercase">PDF</span>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(c.quotes || []).length > 0 && (
                      <div className="mt-3 border-t border-light-grey/60 pt-2 text-sm">
                        <strong>Received Quotes:</strong>{' '}
                        {c.quotes.map((q) => (
                          <span key={q.id} className="ml-2 chip !bg-green-50 !text-green-800 !border-green-200">
                            {formatDZD(q.amount)} {q.note ? `(${q.note})` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div className="mt-6 border border-light-grey bg-white p-6">
            <h2 className="font-heading text-xl font-bold uppercase text-primary">Favorite Products</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Favorites API endpoints/persistence can be expanded in a later iteration.</p>
          </div>
        )}
      </section>
    </div>
  );
}
