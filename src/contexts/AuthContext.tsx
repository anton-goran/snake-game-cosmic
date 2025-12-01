import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockBackend, User } from '@/lib/mockBackend';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user on mount
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await mockBackend.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, error } = await mockBackend.login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    return { error };
  };

  const signup = async (email: string, password: string, username: string) => {
    const { user: newUser, error } = await mockBackend.signup(email, password, username);
    if (newUser) {
      setUser(newUser);
    }
    return { error };
  };

  const logout = async () => {
    await mockBackend.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
