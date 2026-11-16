import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { user, login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated && ['ADMIN', 'MANAGER'].includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const u = await login({ email, password });
      if (!['ADMIN', 'MANAGER'].includes(u?.role)) {
        setError('Access denied. Admin or manager role required.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md border border-light-grey bg-white p-8">
        <p className="section-kicker">PRETWEAR</p>
        <h1 className="mt-2 font-heading text-3xl font-bold uppercase text-primary">Admin Login</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Sign in with an ADMIN or MANAGER account.</p>
        {isAuthenticated && !['ADMIN','MANAGER'].includes(user?.role) && <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">Logged in as {user.email} ({user.role}) — insufficient permissions.</div>}
        {error && <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="mt-6 space-y-3">
          <input type="email" required className="input-field" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" required className="input-field" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">Sample (after seed): admin@pretwear.demo / Password123!</p>
      </form>
    </div>
  );
}
