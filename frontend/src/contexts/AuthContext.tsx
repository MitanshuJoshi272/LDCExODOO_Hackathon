import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  toggleSaveDestination: (cityId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Normalizes the backend's UserProfileResponse (snake_case saved_destinations)
// into the frontend's UserProfile shape (camelCase savedDestinations).
function mapUser(raw: any): UserProfile {
  return {
    name: raw.name,
    email: raw.email,
    avatar: raw.avatar,
    language: raw.language,
    savedDestinations: raw.saved_destinations ?? raw.savedDestinations ?? [],
    role: raw.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = user !== null;

  // On first load, if a token exists, verify it against the backend and
  // restore the session. This replaces the old approach of trusting
  // whatever was cached in localStorage without ever checking the server.
  useEffect(() => {
    const token = localStorage.getItem('gt_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.auth
      .getMe()
      .then((raw) => setUser(mapUser(raw)))
      .catch(() => {
        localStorage.removeItem('gt_token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Throws on 401/invalid credentials — the caller (Login.tsx) is
    // responsible for catching this and showing the error to the user.
    const data = await api.auth.login(email, password);
    setUser(mapUser(data.user));
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const data = await api.auth.signup(name, email, password);
    setUser(mapUser(data.user));
    return true;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const updateProfile = async (patch: Partial<UserProfile>) => {
    const updated = await api.users.updateProfile(patch);
    setUser(mapUser(updated));
  };

  const toggleSaveDestination = async (cityId: string) => {
    if (!user) return;
    const isSaved = user.savedDestinations.includes(cityId);
    const updated = isSaved
      ? await api.users.removeSavedDestination(cityId)
      : await api.users.saveDestination(cityId);
    setUser(mapUser(updated));
  };

  const resetPassword = async (email: string) => {
    await api.auth.resetPassword(email);
  };

  const deleteAccount = async () => {
    await api.users.deleteAccount();
    api.auth.logout();
    localStorage.removeItem('gt_trips');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
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
