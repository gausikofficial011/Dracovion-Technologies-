import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

export type UserRole =
  | 'client'
  | 'employee'
  | 'owner'
  | 'ceo'
  | 'super_admin'
  | 'admin'
  | 'student'
  | 'partner'
  | 'team_member';

export type PortalType = 'client' | 'workspace';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  portalType?: PortalType;
  accountType?: 'student' | 'company' | 'individual';
  companyName?: string;
  collegeOrUniversity?: string;
  department?: string;
  degree?: string;
  academicYear?: string;
  registerNumber?: string;
  githubProfile?: string;
  linkedinProfile?: string;
  projectDomain?: string;
  industry?: string;
  companyWebsite?: string;
  companySize?: string;
  gstin?: string;
  city?: string;
  state?: string;
  workAddress?: string;
  bio?: string;
  avatarUrl?: string;
  designation?: string;
  employeeCode?: string;
  isEmailVerified?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isClient: boolean;
  isWorkspaceStaff: boolean;
  isSuperAdmin: boolean;
  isManagement: boolean;
  // Profile update
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  // Client Portal OTP & Auth
  sendClientOTP: (email: string, purpose?: string) => Promise<{ message: string; cooldownSeconds: number }>;
  verifyClientOTP: (payload: {
    email: string;
    otp: string;
    fullName?: string;
    password?: string;
    phone?: string;
    companyName?: string;
  }) => Promise<User>;
  clientLogin: (credentials: { email: string; password: string }) => Promise<User>;
  // Google Credential Verification
  verifyGoogleCredential: (credential: string) => Promise<User>;
  // Workspace Staff Login
  workspaceLogin: (credentials: { email: string; password: string }) => Promise<User>;
  // Legacy compatibility methods
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get<{ success: boolean; user: User | null }>('/auth/me');
      setUser(res.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleSessionExpired = () => {
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('dracovion:session-expired', handleSessionExpired);
    return () => window.removeEventListener('dracovion:session-expired', handleSessionExpired);
  }, []);

  const sendClientOTP = async (email: string, purpose = 'email_verification') => {
    return api.post<{ message: string; cooldownSeconds: number }>('/auth/client/send-otp', {
      email,
      purpose,
    });
  };

  const verifyClientOTP = async (payload: {
    email: string;
    otp: string;
    fullName?: string;
    password?: string;
    phone?: string;
    companyName?: string;
  }): Promise<User> => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/client/verify-otp', payload);
    setUser(res.user);
    return res.user;
  };

  const clientLogin = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/client/login', credentials);
    setUser(res.user);
    return res.user;
  };

  const verifyGoogleCredential = async (credential: string): Promise<User> => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/client/google/verify-credential', {
      credential,
    });
    setUser(res.user);
    return res.user;
  };

  const workspaceLogin = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/workspace/login', credentials);
    setUser(res.user);
    return res.user;
  };

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/login', credentials);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: any): Promise<User> => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/register', payload);
    setUser(res.user);
    return res.user;
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    const res = await api.put<{ success: boolean; message: string; user: User }>('/auth/profile', profileData);
    if (res.user) {
      setUser(res.user);
    }
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const isClient = user?.portalType === 'client' || user?.role === 'client';
  const isWorkspaceStaff =
    user?.portalType === 'workspace' ||
    user?.role === 'employee' ||
    user?.role === 'owner' ||
    user?.role === 'ceo' ||
    user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isManagement = user?.role === 'super_admin' || user?.role === 'ceo' || user?.role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isClient,
        isWorkspaceStaff,
        isSuperAdmin,
        isManagement,
        sendClientOTP,
        verifyClientOTP,
        clientLogin,
        verifyGoogleCredential,
        workspaceLogin,
        login,
        register,
        updateProfile,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
