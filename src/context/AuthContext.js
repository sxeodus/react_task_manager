import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const fetchUser = async () => {
      if (storedToken) {
        setToken(storedToken);
        setIsLoggedIn(true);
          try {
            const response = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            setUser(response.data.data);
          } catch (error) {
            console.error("Error fetching user data:", error);
            localStorage.removeItem('token'); 
            setToken(null);
            setIsLoggedIn(false);
            setUser(null);
          }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const login = async (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user data after login:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  const contextValue = {
    user,
    token,
    isLoggedIn,
    loading,
    login,
    register: login, // Alias register to login for components that use it
    logout,
  };

    return (
      <AuthContext.Provider value={contextValue}>
        {!loading && children}
      </AuthContext.Provider>
    );
};

export default AuthContext;