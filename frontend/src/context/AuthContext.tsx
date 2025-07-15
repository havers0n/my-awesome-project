import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/services/supabaseClient';
import axios from 'axios';
import api from '@/services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User, AuthResponse } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  location_id: number | null;
  organization_id: number | null;
}

interface AuthError {
  message: string;
  code?: string;
}

interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

interface UpdateUserResponse {
  user: User;
  success: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResponse>;
  updateUser: (data: { password?: string; email?: string }) => Promise<UpdateUserResponse>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('EVENT in AuthContext.tsx:', _event, 'SESSION:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
    const res = await api.post('/auth/reset-password', { email });
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
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (e) {
      setUser(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUser,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
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