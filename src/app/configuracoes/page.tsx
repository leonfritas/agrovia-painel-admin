'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { 
  CogIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Definir data atual apenas no cliente
    setCurrentDate(new Date().toLocaleDateString('pt-BR'));
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
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
              <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie as configurações da sua conta e do sistema
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-6">
                    <UserIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Perfil do Usuário
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nome de Usuário
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          value={user.nomeUsuario}
                          disabled
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          <ShieldCheckIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Nome de usuário não pode ser alterado
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Conta
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          value={user.ativoAdm ? 'Administrador' : 'Usuário'}
                          disabled
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          <ShieldCheckIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-6">
                    <InformationCircleIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Informações do Sistema
                    </h3>
                  </div>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Versão do Sistema</dt>
                      <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Última Atualização</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {currentDate || 'Carregando...'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">API Base URL</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ambiente</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {process.env.NODE_ENV || 'development'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-6">
                    <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Segurança
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Alterar Senha
                        </h4>
                        <p className="text-sm text-yellow-700">
                          Para alterar sua senha, entre em contato com o administrador do sistema.
                        </p>
                      </div>
                      <Button variant="secondary" size="sm" disabled>
                        Alterar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-green-800">
                          Sessão Ativa
                        </h4>
                        <p className="text-sm text-green-700">
                          Sua sessão está ativa e segura.
                        </p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Seguro</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-6">
                    <CogIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Ações
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Fazer Logout
                        </h4>
                        <p className="text-sm text-gray-500">
                          Encerrar sua sessão atual e retornar à tela de login.
                        </p>
                      </div>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={handleLogout}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
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
