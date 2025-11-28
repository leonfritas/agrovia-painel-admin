'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { 
  EnvelopeIcon,
  TrashIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import api, { emailsAPI } from '@/lib/api';

interface Email {
  idEmail: number;
  email: string;
  data: string;
}

export default function EmailsPage() {
  const router = useRouter();
  const { isAuthenticated, user, token, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmails: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
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

    loadEmails();
  }, [isAuthenticated, user, token, authChecked, currentPage, router, isAdmin]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await emailsAPI.getAll(currentPage, 20);
      setEmails(response.emails || []);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      console.error('Erro ao carregar emails:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este email?')) {
      return;
    }

    try {
      await emailsAPI.delete(id);
      loadEmails();
    } catch (error: any) {
      console.error('Erro ao deletar email:', error);
      alert('Erro ao deletar email. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEmails = emails.filter((email) =>
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-semibold text-gray-900">Emails Cadastrados</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie os emails cadastrados na newsletter
              </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total de Emails</p>
                    <p className="text-2xl font-bold text-gray-900">{pagination.totalEmails}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Página Atual</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pagination.currentPage} / {pagination.totalPages}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <EnvelopeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Exibindo</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredEmails.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Busca */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tabela de Emails */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Cadastro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmails.length > 0 
                      ? filteredEmails.map((email, index) => (
                          <tr key={email.idEmail || `email-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{email.idEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{email.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(email.data)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDelete(email.idEmail)}
                                className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Deletar
                              </button>
                            </td>
                          </tr>
                        ))
                      : (
                          <tr key="no-emails">
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              {searchTerm ? 'Nenhum email encontrado com o termo buscado.' : 'Nenhum email cadastrado ainda.'}
                            </td>
                          </tr>
                        )
                    }
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Mostrando página {pagination.currentPage} de {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

