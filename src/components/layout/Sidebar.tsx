'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  UsersIcon,
  TagIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const getNavigation = (isAdmin: boolean) => [
  { name: 'Dashboard', href: '/', icon: HomeIcon, show: true },
  { name: 'Usuários', href: '/usuarios', icon: UsersIcon, show: true },
  { name: 'Categorias', href: '/categorias', icon: TagIcon, show: isAdmin },
  { name: 'Posts', href: '/posts', icon: DocumentTextIcon, show: isAdmin },
  { name: 'Vídeos', href: '/videos', icon: VideoCameraIcon, show: isAdmin },
  { name: 'Comentários', href: '/comentarios', icon: ChatBubbleLeftRightIcon, show: isAdmin },
  { name: 'Relatórios', href: '/relatorios', icon: ChartBarIcon, show: isAdmin },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon, show: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, user } = useAuth();
  const navigation = getNavigation(isAdmin);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Agrovia Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              if (!item.show) return null;
              
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isAdmin ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  <span className="text-sm font-medium text-white">
                    {user?.nomeUsuario?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.nomeUsuario || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
