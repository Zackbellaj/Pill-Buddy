"use client";

import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosInstance } from 'axios';
import api from '@/lib/api'; // Assurez-vous que le chemin d'accès est correct

// --- TYPES (Interfaces TypeScript) ---

interface AuthContextType {
  authToken: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  api: AxiosInstance; // Type de l'instance Axios
}

interface AuthProviderProps {
  children: ReactNode;
}

/** @type {React.Context<AuthContextType | undefined>} */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @param {AuthProviderProps} props
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialisation du token au montage
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    authToken,
    isAuthenticated: !!authToken,
    login,
    logout,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte d'authentification
 * @returns {AuthContextType}
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};