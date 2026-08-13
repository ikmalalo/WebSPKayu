import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  currentUser: User | null;
  loginSession: (token: string, user: User) => void;
  logoutSession: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('spk_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success) {
          setCurrentUser(response.data.data.user);
        } else {
          logoutSession();
        }
      } catch (error) {
        logoutSession();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const loginSession = (newToken: string, user: User) => {
    localStorage.setItem('spk_token', newToken);
    setToken(newToken);
    setCurrentUser(user);
  };

  const logoutSession = () => {
    localStorage.removeItem('spk_token');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, loginSession, logoutSession, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
