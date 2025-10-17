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
  imagemThumb: z.string().optional(),
  nomeAutor: z.string().optional(),
  cargoAutor: z.string().optional(),
  ordem: z.number().optional(),
});

type VideoFormData = z.infer<typeof videoSchema>;

export default function VideosPage() {
  const router = useRouter();
  const { isAuthenticated, canManageContent, isAdmin, user: currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      
      
      setVideos(videosRes?.videos || []);
      setTotalPages(videosRes?.pagination?.totalPages || 1);
      setCategories(categoriesRes?.categorias || []);
      
      // Carregar usuários apenas se for admin
      if (isAdmin) {
        const usersRes = await usersAPI.getAll(1, 100);
        setUsers(usersRes?.usuarios || []);
      } else {
        // Para usuários não-admin, usar apenas o usuário atual
        if (currentUser) {
          setUsers([currentUser]);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setVideos([]);
      setCategories([]);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'image'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upload do arquivo');
    }
    
    const result = await response.json();
    
    // Para vídeos, retornar o caminho correto
    if (type === 'video') {
      return `./public/videos/${result.fileName}`;
    }
    
    return result.url;
  };

  const onSubmit = async (data: VideoFormData) => {
    try {
      setUploading(true);
      
      
      // Verificar se é uma das categorias especiais
      const selectedCategory = categories.find(cat => cat.idCategoria === data.idCategoria);
      const isSpecialCategory = selectedCategory?.nomeCategoria === 'Agrovia Inspira' || 
                               selectedCategory?.nomeCategoria === 'Agrovia Conversa';
      
      // Fazer upload dos arquivos se houver
      let videoUrl = data.urlArquivo;
      let imageUrl = data.imagemThumb;
      
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video');
      }
      
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'image');
      }
      
      // Validar se pelo menos o vídeo foi fornecido
      if (!videoUrl && !videoFile) {
        throw new Error('É necessário fazer upload de um vídeo');
      }
      
      // Preparar dados para envio
      const videoData = {
        nomeVideo: data.nomeVideo,
        descricao: data.descricao,
        idUsuario: Number(data.idUsuario), // Garantir que seja number
        idCategoria: Number(data.idCategoria), // Garantir que seja number
        urlArquivo: videoUrl,
        imagemThumb: imageUrl,
        nomeAutor: data.nomeAutor,
        cargoAutor: data.cargoAutor,
        ordem: data.ordem || 0,
        ativo: true,
        dataUpload: new Date().toISOString(),
      };
      
      // Log detalhado dos dados antes do envio
      console.log('=== DADOS DO VÍDEO ANTES DO ENVIO ===');
      console.log('nomeVideo:', videoData.nomeVideo, 'tipo:', typeof videoData.nomeVideo);
      console.log('descricao:', videoData.descricao, 'tipo:', typeof videoData.descricao);
      console.log('idUsuario:', videoData.idUsuario, 'tipo:', typeof videoData.idUsuario);
      console.log('idCategoria:', videoData.idCategoria, 'tipo:', typeof videoData.idCategoria);
      console.log('urlArquivo:', videoData.urlArquivo, 'tipo:', typeof videoData.urlArquivo);
      console.log('imagemThumb:', videoData.imagemThumb, 'tipo:', typeof videoData.imagemThumb);
      console.log('nomeAutor:', videoData.nomeAutor, 'tipo:', typeof videoData.nomeAutor);
      console.log('cargoAutor:', videoData.cargoAutor, 'tipo:', typeof videoData.cargoAutor);
      console.log('ordem:', videoData.ordem, 'tipo:', typeof videoData.ordem);
      console.log('ativo:', videoData.ativo, 'tipo:', typeof videoData.ativo);
      console.log('dataUpload:', videoData.dataUpload, 'tipo:', typeof videoData.dataUpload);
      console.log('=====================================');
      
      
      // Validar campos obrigatórios
      if (!videoData.nomeVideo || !videoData.descricao || !videoData.idCategoria || !videoData.idUsuario) {
        throw new Error('Campos obrigatórios não preenchidos');
      }
      
      // Validar se o usuário existe na lista carregada
      const userExists = users.find(u => u.idUsuario === videoData.idUsuario);
      if (!userExists) {
        console.error(`Usuário com ID ${videoData.idUsuario} não encontrado. Usuários disponíveis:`, users.map(u => u.idUsuario));
        throw new Error(`Usuário com ID ${videoData.idUsuario} não encontrado. Recarregue a página.`);
      }
      
      // Validar se a categoria existe na lista carregada
      const categoryExists = categories.find(c => c.idCategoria === videoData.idCategoria);
      if (!categoryExists) {
        console.error(`Categoria com ID ${videoData.idCategoria} não encontrada. Categorias disponíveis:`, categories.map(c => c.idCategoria));
        throw new Error(`Categoria com ID ${videoData.idCategoria} não encontrada. Recarregue a página.`);
      }
      
      
      // Verificar se os campos obrigatórios não estão vazios ou undefined
      if (!videoData.nomeVideo || videoData.nomeVideo.trim() === '') {
        throw new Error('Nome do vídeo não pode estar vazio');
      }
      if (!videoData.descricao || videoData.descricao.trim() === '') {
        throw new Error('Descrição não pode estar vazia');
      }
      if (!videoData.idUsuario || videoData.idUsuario <= 0) {
        throw new Error('ID do usuário inválido');
      }
      if (!videoData.idCategoria || videoData.idCategoria <= 0) {
        throw new Error('ID da categoria inválido');
      }
      
      
      if (editingVideo) {
        await videosAPI.update(editingVideo.idVideo, videoData);
      } else {
        await videosAPI.create(videoData);
      }
      
      setIsModalOpen(false);
      setEditingVideo(null);
      setVideoFile(null);
      setImageFile(null);
      reset();
      loadData();
      
      // Mostrar mensagem especial para categorias de vídeo
      if (isSpecialCategory) {
        alert(`Vídeo salvo com sucesso! Ele será exibido automaticamente no carrossel da seção "${selectedCategory?.nomeCategoria}" no site.`);
      }
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      console.error('Detalhes do erro:', error.response?.data);
      alert('Erro ao salvar vídeo. Verifique se os arquivos são válidos.');
    } finally {
      setUploading(false);
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
      imagemThumb: video.imagemThumb || '',
      nomeAutor: video.nomeAutor || '',
      cargoAutor: video.cargoAutor || '',
      ordem: video.ordem || 0,
    });
    setVideoFile(null);
    setImageFile(null);
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
    // Usar o usuário atual ou o primeiro usuário disponível
    const defaultUserId = currentUser?.idUsuario || (users.length > 0 ? users[0].idUsuario : 1);
    reset({
      idUsuario: defaultUserId,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
    setVideoFile(null);
    setImageFile(null);
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
                              const url = video.urlArquivo;
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
        {/* Nota sobre categorias especiais */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>📹 Categorias especiais:</strong> Vídeos salvos nas categorias "Agrovia Inspira" e "Agrovia Conversa" 
            são automaticamente exibidos no carrossel do site web.
          </p>
        </div>
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
                {categories.map((category) => {
                  const isSpecial = category.nomeCategoria === 'Agrovia Inspira' || 
                                  category.nomeCategoria === 'Agrovia Conversa';
                  return (
                    <option key={category.idCategoria} value={category.idCategoria}>
                      {category.nomeCategoria} {isSpecial ? '📹' : ''}
                    </option>
                  );
                })}
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

          {/* Upload de Vídeo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo de Vídeo (MP4)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {videoFile && (
                <span className="text-sm text-green-600">
                  ✓ {videoFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ou use URL do arquivo abaixo
            </p>
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem de Capa (JPG/PNG)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {imageFile && (
                <span className="text-sm text-green-600">
                  ✓ {imageFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Imagem que será exibida como capa do vídeo
            </p>
          </div>

          {/* URL do arquivo (preenchida automaticamente) */}
          <div>
            <Input
              label="URL do Arquivo (preenchida automaticamente)"
              {...register('urlArquivo')}
              error={errors.urlArquivo?.message}
              placeholder="Será preenchida automaticamente ao fazer upload"
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              A URL será preenchida automaticamente quando você fizer upload do vídeo
            </p>
          </div>

          {/* Campos adicionais */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome do Autor"
              {...register('nomeAutor')}
              placeholder="Nome do autor do vídeo"
            />

            <Input
              label="Cargo do Autor"
              {...register('cargoAutor')}
              placeholder="Ex: Engenheiro, Produtor, etc."
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>Nota: Pelo menos uma URL (arquivo ou externa) deve ser fornecida, ou faça upload de um arquivo de vídeo.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Salvando...' : (editingVideo ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
