import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const fetchUser = async () => {
      if (storedToken) {
        setToken(storedToken);
        setIsLoggedIn(true);
          try {
            const response = await axios.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            setUser(response.data.data);
          } catch (error) {
            console.error("Error fetching user data:", error);
            localStorage.removeItem('token'); // Clear invalid token
            setToken(null);
            setIsLoggedIn(false);
            setUser(null);
          }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setIsLoggedIn(true);
  };

  const register = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoggedIn(true);
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
    register,
    logout,
  };

    return (
      <AuthContext.Provider value={contextValue}>
        {!loading && children}
      </AuthContext.Provider>
    );
};

export default AuthContext;