import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  location_id: number | null;
  organization_id: number | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateUser: (data: { password?: string; email?: string }) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Получение профиля пользователя с бэкенда
  const fetchProfile = async (access_token?: string) => {
    try {
      const session = access_token
        ? { access_token }
        : (await supabase.auth.getSession()).data.session;
      if (!session) {
        setUser(null);
        return;
      }
      const { access_token: token } = session;
      const res = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (e) {
      setUser(null);
    }
  };

  // Слушаем изменения сессии
  useEffect(() => {
    setLoading(true);
    const getSessionAndProfile = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('[AuthContext] getSession initial:', data.session);
      if (data.session) {
        await fetchProfile(data.session.access_token);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    getSessionAndProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] onAuthStateChange event:', event, 'session:', session, 'location:', location.pathname);
      const publicPaths = ['/signin', '/signup', '/reset-password', '/update-password'];
      if (event === 'PASSWORD_RECOVERY') {
        // При восстановлении пароля всегда на страницу смены пароля
        if (location.pathname !== '/update-password') {
          navigate('/update-password', { replace: true });
        }
        return;
      }
      if (session) {
        await fetchProfile(session.access_token);
        // Не редиректим, если уже на публичной странице
        if (!publicPaths.includes(location.pathname)) {
          navigate('/', { replace: true }); // или '/dashboard', если у вас другой путь
        }
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // После входа обновляем профиль
    await fetchProfile(data.session?.access_token);
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    // Вызываем наш бэкенд
    const res = await axios.post('/auth/reset-password', { email });
    return res.data;
  };

  const updateUser = async (data: { password?: string; email?: string }) => {
    const { error } = await supabase.auth.updateUser(data);
    if (error) throw error;
    // После обновления данных обновляем профиль
    await fetchProfile();
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, resetPassword, updateUser, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 