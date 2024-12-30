
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const decodedToken: any = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        setIsAuthenticated(true);
        setUser(decodedToken);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('your-api-url/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      setIsAuthenticated(true);
      setUser(jwtDecode(data.accessToken));
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuthStatus,
  };
};