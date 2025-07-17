// ... existing code ...
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient'; // Fixed import path
import api from '../services/api'; // Import API service separately
import { User } from '../types.admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`EVENT in App.tsx: ${event} SESSION:`, session);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (session) {
        // При входе или при наличии начальной сессии, загружаем профиль
        await fetchProfile(session.access_token);
        setLoading(false);
      } else {
        // Если сессии нет (например, первый запуск или после выхода)
        setLoading(false);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (token?: string) => {
    try {
      let authToken = token;
      if (!authToken) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase session error:', error);
          setUser(null);
          return;
        }
        authToken = session?.access_token;
      }

      if (!authToken) {
        setUser(null);
        return;
      }

      // Add proper headers to API request
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      setUser(response.data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setUser(null);
      // Consider adding error state handling here
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      await fetchProfile(data.session.access_token);
    }
    return data;
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};