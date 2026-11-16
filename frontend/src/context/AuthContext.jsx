import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authApi.me()
      .then((res) => { if (mounted) setUser(res.data?.user || null); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    const u = res.data?.user || null;
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    const u = res.data?.user || null;
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setUser(null);
  };

  const refresh = async () => {
    try {
      const res = await authApi.me();
      const u = res.data?.user || null;
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    }
  };

  const value = useMemo(() => ({ user, loading, isAuthenticated: !!user, login, register, logout, refresh }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
