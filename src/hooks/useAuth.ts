'use client';

import { useState, useEffect } from 'react';
import { getAuthState, setAuthState, clearAuthState, AuthState } from '@/lib/auth';
import { User } from '@/lib/api';

export function useAuth() {
  const [authState, setAuthStateInternal] = useState<AuthState>(() => {
    // Inicializar com o estado do localStorage se estiver no cliente
    if (typeof window !== 'undefined') {
      return getAuthState();
    }
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  });

  useEffect(() => {
    // Sincronizar com localStorage quando o componente monta
    const state = getAuthState();
    setAuthStateInternal(state);
  }, []);

  const login = (user: User, token: string) => {
    setAuthState(user, token);
    const newState = getAuthState();
    setAuthStateInternal(newState);
  };

  const logout = () => {
    clearAuthState();
    setAuthStateInternal({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  };

  const canEditUser = (targetUserId: number) => {
    if (!authState.user) return false;
    
    // Administradores podem editar qualquer usuário
    if (authState.isAdmin) return true;
    
    // Usuários comuns só podem editar a si mesmos
    return authState.user.idUsuario === targetUserId;
  };

  const canDeleteUser = (targetUserId: number) => {
    if (!authState.user) return false;
    
    // Apenas administradores podem deletar usuários
    return authState.isAdmin;
  };

  const canToggleAdmin = () => {
    // Apenas administradores podem alterar status de admin
    return authState.isAdmin;
  };

  const canManageContent = () => {
    // Apenas administradores podem gerenciar categorias, posts e vídeos
    return authState.isAdmin;
  };

  return {
    ...authState,
    login,
    logout,
    canEditUser,
    canDeleteUser,
    canToggleAdmin,
    canManageContent,
  };
}
