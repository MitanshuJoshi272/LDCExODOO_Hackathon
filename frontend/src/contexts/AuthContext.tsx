import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  language: string;
  savedDestinations: string[];
  role: 'user' | 'admin';
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleSaveDestination: (cityId: string) => void;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_USER: UserProfile = {
  name: 'Maya Rao',
  email: 'maya@globetrotter.io',
  avatar: 'MR',
  language: 'English',
  savedDestinations: ['lisbon', 'kyoto'],
  role: 'admin',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gt_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return DEFAULT_USER;
  });

  const isLoggedIn = user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem('gt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gt_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email.trim().toLowerCase() === 'admin@globetrotter.io') {
      setUser({
        name: 'Administrator',
        email: 'admin@globetrotter.io',
        avatar: 'AD',
        language: 'English',
        savedDestinations: [],
        role: 'admin',
      });
      return true;
    }
    const nameStr = email.split('@')[0];
    const initials = nameStr.slice(0, 2).toUpperCase() || 'US';
    setUser({
      name: nameStr.charAt(0).toUpperCase() + nameStr.slice(1),
      email: email,
      avatar: initials,
      language: 'English',
      savedDestinations: [],
      role: 'user',
    });
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US';
    setUser({
      name,
      email,
      avatar: initials,
      language: 'English',
      savedDestinations: [],
      role: 'user',
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const toggleSaveDestination = (cityId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const isSaved = prev.savedDestinations.includes(cityId);
      const nextList = isSaved
        ? prev.savedDestinations.filter((id) => id !== cityId)
        : [...prev.savedDestinations, cityId];
      return { ...prev, savedDestinations: nextList };
    });
  };

  const resetPassword = async (email: string) => {
    return new Promise<void>((resolve) => setTimeout(resolve, 800));
  };

  const deleteAccount = () => {
    localStorage.removeItem('gt_user');
    localStorage.removeItem('gt_trips');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        signup,
        logout,
        updateProfile,
        toggleSaveDestination,
        resetPassword,
        deleteAccount,
      }}
    >
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
