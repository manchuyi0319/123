import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Teacher, AuthResponse, LoginRequest, RegisterRequest } from 'shared';
import { apiRequest, setToken, clearToken, hasToken } from '../api/client';

interface AuthState {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(!!hasToken());

  useEffect(() => {
    if (hasToken()) {
      apiRequest<{ teacher: Teacher }>('/auth/me')
        .then(data => setTeacher(data.teacher))
        .catch(() => clearToken())
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.token);
    setTeacher(res.teacher);
  };

  const register = async (data: RegisterRequest) => {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.token);
    setTeacher(res.teacher);
  };

  const logout = () => {
    clearToken();
    setTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        isAuthenticated: !!teacher,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
