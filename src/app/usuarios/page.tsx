'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usersAPI, User } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PencilIcon, TrashIcon, PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

// Schema unificado (senha opcional, mas se fornecida deve ter no mínimo 6 caracteres)
const userSchema = z.object({
  nomeUsuario: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  senhaUsuario: z.string().optional(),
  ativoAdm: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsuariosPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user: currentUser, canEditUser, canDeleteUser, canToggleAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Apenas administradores podem acessar esta página
      const response = await usersAPI.getAll(currentPage, 10);
      setUsers(response?.usuarios || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Apenas administradores podem acessar esta página
    if (!isAdmin) {
      router.push('/');
      return;
    }

    loadUsers();
  }, [isAuthenticated, isAdmin, router, currentPage, loadUsers]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Ao editar, só enviar senha se foi preenchida
        const updateData: any = {
          nomeUsuario: data.nomeUsuario,
          ativoAdm: data.ativoAdm,
        };
        
        // Só incluir senha se foi preenchida e tiver no mínimo 6 caracteres
        if (data.senhaUsuario && data.senhaUsuario.trim() !== '') {
          if (data.senhaUsuario.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
          }
          updateData.senhaUsuario = data.senhaUsuario;
        }
        
        await usersAPI.update(editingUser.idUsuario, updateData);
      } else {
        // Ao criar, senha é obrigatória
        if (!data.senhaUsuario || data.senhaUsuario.trim() === '') {
          alert('A senha é obrigatória ao criar um novo usuário.');
          return;
        }
        if (data.senhaUsuario.length < 6) {
          alert('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        // Garantir que senhaUsuario seja string (não undefined)
        await usersAPI.create({
          nomeUsuario: data.nomeUsuario,
          senhaUsuario: data.senhaUsuario,
          ativoAdm: data.ativoAdm,
        });
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
      loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Tente novamente.');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      nomeUsuario: user.nomeUsuario,
      senhaUsuario: '', // Deixar vazio ao editar (opcional)
      ativoAdm: user.ativoAdm,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usersAPI.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  const handleToggleAdmin = async (id: number) => {
    try {
      await usersAPI.toggleAdmin(id);
      loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status de admin:', error);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gerencie os usuários do sistema e permissões de administrador
                </p>
              </div>
              {isAdmin && (
                <Button onClick={openCreateModal}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Novo Usuário
                </Button>
              )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome de Usuário</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.idUsuario}>
                      <TableCell>{user.idUsuario}</TableCell>
                      <TableCell className="font-medium">{user.nomeUsuario}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.ativoAdm
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.ativoAdm ? 'Sim' : 'Não'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {canEditUser(user.idUsuario) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              title="Editar usuário"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {canToggleAdmin() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAdmin(user.idUsuario)}
                              title="Alterar status de administrador"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteUser(user.idUsuario) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.idUsuario)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir usuário"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome de Usuário"
            {...register('nomeUsuario')}
            error={errors.nomeUsuario?.message}
            placeholder="Digite o nome de usuário"
          />

          <Input
            label={editingUser ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}
            type="password"
            {...register('senhaUsuario')}
            error={errors.senhaUsuario?.message}
            placeholder={editingUser ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('ativoAdm')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Administrador
            </label>
            <p className="ml-2 text-xs text-gray-500">
              (Marque para tornar este usuário administrador)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingUser ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
