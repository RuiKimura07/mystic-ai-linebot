'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email?: string;
  pictureUrl?: string;
  role: 'user' | 'admin';
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// デモ用のモックユーザー
const MOCK_USER: User = {
  id: 'demo-user-001',
  name: '山田太郎',
  email: 'demo@example.com',
  pictureUrl: '',
  role: 'user',
  balance: 1200,
};

const MOCK_ADMIN: User = {
  id: 'admin-001',
  name: '管理者',
  email: 'admin@example.com',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // デモモード：自動的にモックユーザーでログイン状態を確認
    const checkAuth = () => {
      const storedAuth = localStorage.getItem('demo-auth');
      if (storedAuth) {
        const userData = JSON.parse(storedAuth);
        setUser(userData);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('demo-auth', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo-auth');
    router.push('/');
  };

  const updateBalance = (newBalance: number) => {
    if (user && user.role === 'user') {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('demo-auth', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    updateBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// デモ用のログイン関数
export function demoLogin(role: 'user' | 'admin' = 'user') {
  const userData = role === 'admin' ? MOCK_ADMIN : MOCK_USER;
  localStorage.setItem('demo-auth', JSON.stringify(userData));
  window.location.href = role === 'admin' ? '/admin/users' : '/dashboard';
}

// デモ用の管理者ログイン関数
export function demoAdminLogin(email: string, password: string) {
  // デモモード：任意のメール/パスワードで管理者としてログイン
  if (email && password) {
    localStorage.setItem('demo-auth', JSON.stringify(MOCK_ADMIN));
    return true;
  }
  return false;
}