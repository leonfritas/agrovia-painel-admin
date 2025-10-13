'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { videosAPI, categoriesAPI, usersAPI, Video, Category, User } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate, truncateText } from '@/lib/utils';
import { PencilIcon, TrashIcon, PlusIcon, PlayIcon } from '@heroicons/react/24/outline';

const videoSchema = z.object({
  nomeVideo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  idCategoria: z.number().min(1, 'Categoria é obrigatória'),
  idUsuario: z.number().min(1, 'Usuário é obrigatório'),
  urlArquivo: z.string().optional(),
  urlExterno: z.string().optional(),
}).refine((data) => data.urlArquivo || data.urlExterno, {
  message: 'Pelo menos uma URL (arquivo ou externa) deve ser fornecida',
  path: ['urlArquivo'],
});

type VideoFormData = z.infer<typeof videoSchema>;

export default function VideosPage() {
  const router = useRouter();
  const { isAuthenticated, canManageContent, isAdmin, currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, router, currentPage, isAdmin, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar vídeos e categorias (todos os usuários podem acessar)
      const [videosRes, categoriesRes] = await Promise.all([
        videosAPI.getAll(currentPage, 10),
        categoriesAPI.getAll(1, 100),
      ]);
      
      setVideos(videosRes.videos);
      setTotalPages(videosRes.pagination.totalPages);
      setCategories(categoriesRes.categorias);
      
      // Carregar usuários apenas se for admin
      if (isAdmin) {
        const usersRes = await usersAPI.getAll(1, 100);
        setUsers(usersRes.usuarios);
      } else {
        // Para usuários não-admin, usar apenas o usuário atual
        if (currentUser) {
          setUsers([currentUser]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VideoFormData) => {
    try {
      if (editingVideo) {
        await videosAPI.update(editingVideo.idVideo, data);
      } else {
        await videosAPI.create(data);
      }
      
      setIsModalOpen(false);
      setEditingVideo(null);
      reset();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    reset({
      nomeVideo: video.nomeVideo,
      descricao: video.descricao,
      idCategoria: video.idCategoria,
      idUsuario: video.idUsuario,
      urlArquivo: video.urlArquivo || '',
      urlExterno: video.urlExterno || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este vídeo?')) {
      try {
        await videosAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir vídeo:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
    reset();
  };

  const getCategoryName = (id: number) => {
    const category = categories.find(c => c.idCategoria === id);
    return category?.nomeCategoria || 'N/A';
  };

  const getUserName = (id: number) => {
    const user = users.find(u => u.idUsuario === id);
    return user?.nomeUsuario || 'N/A';
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
                <h1 className="text-2xl font-semibold text-gray-900">Vídeos</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gerencie os vídeos do sistema
                </p>
              </div>
              {canManageContent() && (
                <Button onClick={openCreateModal}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Novo Vídeo
                </Button>
              )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.idVideo}>
                      <TableCell>{video.idVideo}</TableCell>
                      <TableCell className="font-medium">{video.nomeVideo}</TableCell>
                      <TableCell className="max-w-xs">
                        {truncateText(video.descricao, 30)}
                      </TableCell>
                      <TableCell>{getCategoryName(video.idCategoria)}</TableCell>
                      <TableCell>{getUserName(video.idUsuario)}</TableCell>
                      <TableCell>{formatDate(video.dataUpload)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.urlArquivo 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {video.urlArquivo ? 'Arquivo' : 'Externo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = video.urlArquivo || video.urlExterno;
                              if (url) window.open(url, '_blank');
                            }}
                            title="Reproduzir vídeo"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                          {canManageContent() && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(video)}
                                title="Editar vídeo"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(video.idVideo)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir vídeo"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </>
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
        title={editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome do Vídeo"
            {...register('nomeVideo')}
            error={errors.nomeVideo?.message}
            placeholder="Digite o nome do vídeo"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              {...register('descricao')}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500"
              placeholder="Digite a descrição do vídeo"
            />
            {errors.descricao && (
              <p className="text-sm text-red-600 mt-1">{errors.descricao.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                {...register('idCategoria', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white text-gray-900"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.idCategoria} value={category.idCategoria}>
                    {category.nomeCategoria}
                  </option>
                ))}
              </select>
              {errors.idCategoria && (
                <p className="text-sm text-red-600 mt-1">{errors.idCategoria.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autor
              </label>
              <select
                {...register('idUsuario', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white text-gray-900"
              >
                <option value="">Selecione um autor</option>
                {users.map((user) => (
                  <option key={user.idUsuario} value={user.idUsuario}>
                    {user.nomeUsuario}
                  </option>
                ))}
              </select>
              {errors.idUsuario && (
                <p className="text-sm text-red-600 mt-1">{errors.idUsuario.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="URL do Arquivo (opcional)"
              {...register('urlArquivo')}
              error={errors.urlArquivo?.message}
              placeholder="https://exemplo.com/video.mp4"
            />

            <Input
              label="URL Externa (opcional)"
              {...register('urlExterno')}
              error={errors.urlExterno?.message}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>Nota: Pelo menos uma URL (arquivo ou externa) deve ser fornecida.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingVideo ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
