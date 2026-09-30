import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('safehelp_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getProfile();
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('safehelp_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authApi.register({ name, email, password, confirmPassword });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('safehelp_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
  };

  const logout = () => {
    localStorage.removeItem('safehelp_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
