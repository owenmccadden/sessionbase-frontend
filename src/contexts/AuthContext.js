import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { isAuthenticated, getUserInfo, removeAuthToken } from '../utils/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      if (isAuthenticated()) {
        const userInfo = getUserInfo();
        setUser(userInfo);
      } else {
        setUser(null);
        // Clean up invalid token
        removeAuthToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      removeAuthToken();
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback((userInfo) => {
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeAuthToken();
    // Force immediate state update
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
