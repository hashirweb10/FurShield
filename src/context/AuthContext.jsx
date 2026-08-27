import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me.php');
      if (res.success) setUser(res.data);
    } catch (e) { /* not logged in */ }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login.php', { email, password });
    if (res.success) setUser(res.data);
    return res;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register.php', formData);
    if (res.success) setUser(res.data);
    return res;
  };

  const logout = async () => {
    await api.post('/auth/logout.php');
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
