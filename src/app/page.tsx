'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usersAPI, categoriesAPI, postsAPI, videosAPI } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { 
  UsersIcon, 
  TagIcon, 
  DocumentTextIcon, 
  VideoCameraIcon 
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalPosts: number;
  totalVideos: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, token, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCategories: 0,
    totalPosts: 0,
    totalVideos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Aguardar um pouco para garantir que o estado de autenticação foi carregado
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (!isAuthenticated || !user || !token) {
      router.push('/login');
      return;
    }

    loadStats();
  }, [isAuthenticated, user, token, authChecked, router]);

  const loadStats = async () => {
    try {
      // Usuários não-admin só podem ver estatísticas de categorias, posts e vídeos
      if (isAdmin) {
        const [usersRes, categoriesRes, postsRes, videosRes] = await Promise.all([
          usersAPI.getAll(1, 1),
          categoriesAPI.getAll(1, 1),
          postsAPI.getAll(1, 1),
          videosAPI.getAll(1, 1),
        ]);

        setStats({
          totalUsers: usersRes.pagination.totalUsuarios,
          totalCategories: categoriesRes.pagination.totalCategorias,
          totalPosts: postsRes.pagination.totalPosts,
          totalVideos: videosRes.pagination.totalVideos,
        });
      } else {
        // Para usuários não-admin, não carregar estatísticas de usuários
        const [categoriesRes, postsRes, videosRes] = await Promise.all([
          categoriesAPI.getAll(1, 1),
          postsAPI.getAll(1, 1),
          videosAPI.getAll(1, 1),
        ]);

        setStats({
          totalUsers: 0,
          totalCategories: categoriesRes.pagination.totalCategorias,
          totalPosts: postsRes.pagination.totalPosts,
          totalVideos: videosRes.pagination.totalVideos,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cards de estatísticas baseado nas permissões do usuário
  const allStatCards = [
    {
      name: 'Usuários',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
      href: '/usuarios',
      adminOnly: true, // Apenas admins podem ver
    },
    {
      name: 'Categorias',
      value: stats.totalCategories,
      icon: TagIcon,
      color: 'bg-green-500',
      href: '/categorias',
      adminOnly: false,
    },
    {
      name: 'Posts',
      value: stats.totalPosts,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      href: '/posts',
      adminOnly: false,
    },
    {
      name: 'Vídeos',
      value: stats.totalVideos,
      icon: VideoCameraIcon,
      color: 'bg-purple-500',
      href: '/videos',
      adminOnly: false,
    },
  ];

  // Filtrar cards baseado nas permissões
  const statCards = allStatCards.filter(card => !card.adminOnly || isAdmin);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Visão geral do sistema Agrovia
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.name}
                  className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(card.href)}
                >
                  <dt>
                    <div className={`absolute ${card.color} rounded-md p-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </p>
                  </dt>
                  <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </p>
                  </dd>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Atividade Recente
                  </h3>
                  <div className="mt-5">
                    <div className="flow-root">
                      <ul className="-mb-8">
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                  <UsersIcon className="h-5 w-5 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Novos usuários cadastrados no sistema
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time>Hoje</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                  <DocumentTextIcon className="h-5 w-5 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Posts sobre agricultura sustentável publicados
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time>Ontem</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="relative">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                                  <VideoCameraIcon className="h-5 w-5 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Vídeos educativos adicionados à plataforma
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time>2 dias atrás</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}