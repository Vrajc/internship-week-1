import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - replace with actual API
      const mockResponse = {
        user: {
          id: '1',
          name: email === 'admin@example.com' ? 'Admin User' : 'John Doe',
          email,
          role: email === 'admin@example.com' ? 'admin' : 'user'
        },
        token: 'mock-jwt-token'
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      setUser(mockResponse.user as User);
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role = 'user'): Promise<boolean> => {
    try {
      // Simulate API call - replace with actual API
      const mockResponse = {
        user: {
          id: Date.now().toString(),
          name,
          email,
          role: role as 'user' | 'admin'
        },
        token: 'mock-jwt-token'
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      setUser(mockResponse.user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};