import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Konfigurasi axios global
const apiHost = window.location.hostname;
axios.defaults.baseURL = `http://${apiHost}:8000`;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [loading, setLoading] = useState(true);

  // Jika ada token di localStorage, masukkan ke header axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Fungsi untuk mengecek user yang sedang login
  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      if(token) await axios.post('/api/logout');
    } catch(e) {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
