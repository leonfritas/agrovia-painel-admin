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
  VideoCameraIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  totalUsers: number;
  totalCategories: number;
  totalPosts: number;
  totalVideos: number;
  adminUsers: number;
  regularUsers: number;
  postsByCategory: Array<{ category: string; count: number }>;
  videosByCategory: Array<{ category: string; count: number }>;
}

export default function RelatoriosPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    totalUsers: 0,
    totalCategories: 0,
    totalPosts: 0,
    totalVideos: 0,
    adminUsers: 0,
    regularUsers: 0,
    postsByCategory: [],
    videosByCategory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadReportData();
  }, [isAuthenticated, router]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [usersRes, categoriesRes, postsRes, videosRes] = await Promise.all([
        usersAPI.getAll(1, 1000),
        categoriesAPI.getAll(1, 1000),
        postsAPI.getAll(1, 1000),
        videosAPI.getAll(1, 1000),
      ]);

      const adminUsers = usersRes.usuarios.filter(user => user.ativoAdm).length;
      const regularUsers = usersRes.usuarios.filter(user => !user.ativoAdm).length;

      // Agrupar posts por categoria
      const postsByCategory = categoriesRes.categorias.map(category => ({
        category: category.nomeCategoria,
        count: postsRes.posts.filter(post => post.idCategoria === category.idCategoria).length,
      }));

      // Agrupar vídeos por categoria
      const videosByCategory = categoriesRes.categorias.map(category => ({
        category: category.nomeCategoria,
        count: videosRes.videos.filter(video => video.idCategoria === category.idCategoria).length,
      }));

      setReportData({
        totalUsers: usersRes.usuarios.length,
        totalCategories: categoriesRes.categorias.length,
        totalPosts: postsRes.posts.length,
        totalVideos: videosRes.videos.length,
        adminUsers,
        regularUsers,
        postsByCategory,
        videosByCategory,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
              <p className="mt-1 text-sm text-gray-600">
                Análise e estatísticas do sistema
              </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Usuários
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {reportData.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {reportData.adminUsers} admins
                    </span>
                    <span className="text-gray-500 ml-2">
                      {reportData.regularUsers} usuários
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TagIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Categorias
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {reportData.totalCategories}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Posts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {reportData.totalPosts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <VideoCameraIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Vídeos
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {reportData.totalVideos}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Posts by Category */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Posts por Categoria
                  </h3>
                  <div className="space-y-3">
                    {reportData.postsByCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {item.category}
                        </span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...reportData.postsByCategory.map(p => p.count))) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Videos by Category */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Vídeos por Categoria
                  </h3>
                  <div className="space-y-3">
                    {reportData.videosByCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {item.category}
                        </span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...reportData.videosByCategory.map(v => v.count))) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Resumo do Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-3">
                      <ArrowTrendingUpIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">Conteúdo Total</h4>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {reportData.totalPosts + reportData.totalVideos}
                    </p>
                    <p className="text-sm text-gray-500">Posts + Vídeos</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto mb-3">
                      <ChartBarIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">Engajamento</h4>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {Math.round((reportData.totalPosts + reportData.totalVideos) / reportData.totalUsers * 100) / 100}
                    </p>
                    <p className="text-sm text-gray-500">Conteúdo por usuário</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto mb-3">
                      <TagIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">Diversidade</h4>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {reportData.totalCategories}
                    </p>
                    <p className="text-sm text-gray-500">Categorias ativas</p>
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
