import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/apiClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const loadUser = async () => {
    try {
      const u = await api('/auth/me');
      setUser(u);
    } catch (e) {
      setUser(null);
    } finally {
      setInitialLoadComplete(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('recovery') === 'true') setRecoveryMode(true);
    loadUser();
  }, []);

  // Compatibilidad con codigo heredado (shpe Supabase-like: { data, error })
  // Actualizacion: la nueva implementación NestJS devuelve directamente el perfil.
  // Envolvemos en try/catch y devolvemos { data, error } para minimizar cambios en los componentes.

  const wrap = async (fn) => {
    try {
      const r = await fn();
      return { data: r, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message || 'error' } };
    }
  };

  const signIn = async (email, password) => {
    const data = await wrap(() => api('/auth/sign-in', { method: 'POST', body: { email, password } }));
    if (data.data) setUser(data.data.profile);
    return data;
  };

  const signUp = async (form) => {
    const data = await wrap(() => api('/auth/sign-up', { method: 'POST', body: form }));
    if (data.data) setUser(data.data.profile);
    return data;
  };

  const signOut = async () => {
    await api('/auth/sign-out', { method: 'POST' });
    setUser(null);
  };

  const resetPassword = async (email) => {
    return api('/auth/password-reset/request', { method: 'POST', body: { email } });
  };

  const updatePassword = async (password) => {
    await api('/auth/password', { method: 'POST', body: { password } });
    setRecoveryMode(false);
  };

  const value = useMemo(
    () => ({ user, loading, initialLoadComplete, recoveryMode, signIn, signUp, signOut, resetPassword, updatePassword }),
    [user, loading, initialLoadComplete, recoveryMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
