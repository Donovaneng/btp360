import React, { createContext, useState, useContext, useEffect } from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté via le localStorage
    const savedUser = localStorage.getItem('btp360_user');
    const token = localStorage.getItem('btp360_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const data = response.data;

      localStorage.setItem('btp360_token', data.token);
      localStorage.setItem('btp360_user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.error ? new Error(error.response.data.error) : error;
    }
  };

  const loginWithGoogle = async (credential, roleId = 2) => {
    try {
      const response = await api.post('/auth/google', { credential, role_id: roleId });
      const data = response.data;

      localStorage.setItem('btp360_token', data.token);
      localStorage.setItem('btp360_user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error.response?.data?.error ? new Error(error.response.data.error) : error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data?.error ? new Error(error.response.data.error) : error;
    }
  };

  const logout = () => {
    localStorage.removeItem('btp360_token');
    localStorage.removeItem('btp360_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/profile');
      const updatedUser = response.data;
      localStorage.setItem('btp360_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, refreshUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
