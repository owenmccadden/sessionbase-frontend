import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { isAuthenticated, getUserInfo, removeAuthToken } from '../utils/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      if (isAuthenticated()) {
        const userInfo = getUserInfo();
        if (userInfo) {
          setUser(userInfo);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback((userInfo) => {
    setUser(userInfo);
    setAuthenticating(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeAuthToken();
    setAuthenticating(false);
    // Force immediate state update
    setLoading(false);
  }, []);

  const setAuthenticatingState = useCallback((state) => {
    setAuthenticating(state);
  }, []);

  const value = {
    user,
    loading,
    authenticating,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
    setAuthenticatingState
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
