import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const getProfile = useCallback(async (user) => {
    if (!user) return null;

    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`role`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      
      return { ...user, role: data?.role || 'member' };
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      return { ...user, role: 'member' };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const getInitialSession = async () => {
      // Iniciar el temporizador de seguridad
      timeoutId = setTimeout(() => {
        if (isMounted && !initialLoadComplete) {
          console.warn("Auth loading timed out. Forcing UI to render.");
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }, 10000); // 10 segundos de tiempo de espera

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          if (session?.user) {
            const profile = await getProfile(session.user);
            if (isMounted) setUser(profile);
          } else {
            if (isMounted) setUser(null);
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId); // Limpiar el temporizador si todo va bien
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          setSession(session);
          if (event === 'PASSWORD_RECOVERY') {
            setRecoveryMode(true);
          }
          if (session?.user) {
            const profile = await getProfile(session.user);
            if (isMounted) setUser(profile);
          } else {
            if (isMounted) setUser(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [getProfile]);

  const signUp = useCallback(async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { data, error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo enviar el email de recuperación",
      });
    }

    return { error };
  }, [toast]);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña",
      });
    } else {
      setRecoveryMode(false);
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión.",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    initialLoadComplete,
    recoveryMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }), [user, session, loading, initialLoadComplete, recoveryMode, signUp, signIn, signOut, resetPassword, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};