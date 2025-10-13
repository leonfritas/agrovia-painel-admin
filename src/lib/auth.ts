import { User } from './api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false, isAdmin: false };
  }

  const token = localStorage.getItem('admin_token');
  const userStr = localStorage.getItem('admin_user');
  
  if (!token || !userStr) {
    return { user: null, token: null, isAuthenticated: false, isAdmin: false };
  }

  try {
    const user = JSON.parse(userStr);
    return { 
      user, 
      token, 
      isAuthenticated: true, 
      isAdmin: user.ativoAdm === true 
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false, isAdmin: false };
  }
};

export const setAuthState = (user: User, token: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('admin_token', token);
  localStorage.setItem('admin_user', JSON.stringify(user));
};

export const clearAuthState = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};

export const isAdmin = (user: User | null): boolean => {
  return user?.ativoAdm === true;
};
