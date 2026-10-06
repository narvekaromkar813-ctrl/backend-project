import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('solarsight_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('solarsight_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('solarsight_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('solarsight_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('solarsight_token');
        localStorage.removeItem('solarsight_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      if (data?.token) {
        localStorage.setItem('solarsight_token', data.token);
        setToken(data.token);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('solarsight_user', JSON.stringify(data.user));
        }
        toast.success(data.message || 'Logged in successfully!');
        return data;
      } else {
        throw new Error('No authentication token received');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      if (data?.token) {
        localStorage.setItem('solarsight_token', data.token);
        setToken(data.token);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('solarsight_user', JSON.stringify(data.user));
        }
        toast.success(data.message || 'Account created successfully!');
        return data;
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('solarsight_token');
    localStorage.removeItem('solarsight_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('solarsight_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
