'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { postsAPI, categoriesAPI, usersAPI, Post, Category, User } from '@/lib/api';
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
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

const postSchema = z.object({
  nomePost: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  conteudo: z.string().optional(),
  idCategoria: z.number().min(1, 'Categoria é obrigatória'),
  linkExterno: z.string().optional(),
  conteudoFooter: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function PostsPage() {
  const router = useRouter();
  const { isAuthenticated, canManageContent, isAdmin, user: currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<{
    imagemDestaque?: File;
    imagemConteudo?: File;
    imagemFooter?: File;
  }>({});
  const [imagePreviews, setImagePreviews] = useState<{
    imagemDestaque?: string;
    imagemConteudo?: string;
    imagemFooter?: File;
  }>({});
  const [imageErrors, setImageErrors] = useState<{
    imagemDestaque?: string;
    imagemConteudo?: string;
    imagemFooter?: string;
  }>({});

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB em bytes

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, router, currentPage, isAdmin, currentUser, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar posts e categorias (todos os usuários podem acessar)
      const [postsRes, categoriesRes] = await Promise.all([
        postsAPI.getAll(currentPage, 10),
        categoriesAPI.getAll(1, 100),
      ]);
      
      // Filtrar posts por categoria se uma categoria estiver selecionada
      const allPosts = postsRes?.posts || [];
      const filteredPosts = selectedCategory 
        ? allPosts.filter(post => post.idCategoria === selectedCategory)
        : allPosts;
      
      setPosts(filteredPosts);
      setTotalPages(postsRes?.pagination?.totalPages || 1);
      setCategories(categoriesRes?.categorias || []);
      
      // Não precisamos mais carregar lista de usuários, pois o autor é sempre o usuário logado
      if (currentUser) {
        setUsers([currentUser]);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setPosts([]);
      setCategories([]);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (field: 'imagemDestaque' | 'imagemConteudo' | 'imagemFooter', file: File | null) => {
    // Limpar erro anterior
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    if (file) {
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > MAX_IMAGE_SIZE) {
        setImageErrors(prev => ({
          ...prev,
          [field]: `Arquivo muito grande! Tamanho máximo permitido: 5MB. Tamanho do arquivo: ${formatFileSize(file.size)}`
        }));
        return;
      }

      // Validar se é uma imagem
      if (!file.type.startsWith('image/')) {
        setImageErrors(prev => ({
          ...prev,
          [field]: 'Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)'
        }));
        return;
      }

      setImageFiles(prev => ({ ...prev, [field]: file }));
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setImageFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[field];
        return newFiles;
      });
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[field];
        return newPreviews;
      });
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      // Garantir que o autor seja sempre o usuário logado
      if (!currentUser?.idUsuario) {
        alert('Erro: Usuário não identificado. Faça login novamente.');
        return;
      }

      // Validar se há erros de imagem antes de enviar
      if (Object.keys(imageErrors).length > 0) {
        alert('Por favor, corrija os erros nas imagens antes de salvar.');
        return;
      }

      console.log('Dados do formulário:', data);
      console.log('Arquivos de imagem:', imageFiles);
      
      // Criar FormData para enviar com imagens
      const formData = new FormData();
      formData.append('nomePost', data.nomePost);
      formData.append('descricao', data.descricao);
      if (data.conteudo) formData.append('conteudo', data.conteudo);
      formData.append('idCategoria', data.idCategoria.toString());
      formData.append('idUsuario', currentUser.idUsuario.toString()); // Sempre usar o usuário logado
      if (data.linkExterno) formData.append('linkExterno', data.linkExterno);
      if (data.conteudoFooter) formData.append('conteudoFooter', data.conteudoFooter);
      
      // Adicionar imagens se foram selecionadas
      if (imageFiles.imagemDestaque) {
        formData.append('imagemDestaque', imageFiles.imagemDestaque);
        console.log('Imagem de destaque adicionada');
      }
      if (imageFiles.imagemConteudo) {
        formData.append('imagemConteudo', imageFiles.imagemConteudo);
        console.log('Imagem de conteúdo adicionada');
      }
      if (imageFiles.imagemFooter) {
        formData.append('imagemFooter', imageFiles.imagemFooter);
        console.log('Imagem de footer adicionada');
      }

      console.log('📤 Enviando para API...');

      if (editingPost) {
        const result = await postsAPI.update(editingPost.idPost, formData);
        console.log('✅ Post atualizado:', result);
      } else {
        const result = await postsAPI.create(formData);
        console.log('✅ Post criado:', result);
      }
      
      alert('Post salvo com sucesso!');
      setIsModalOpen(false);
      setEditingPost(null);
      setImageFiles({});
      setImagePreviews({});
      reset();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar post:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      alert(`Erro ao salvar post: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    reset({
      nomePost: post.nomePost,
      descricao: post.descricao,
      conteudo: post.conteudo,
      idCategoria: post.idCategoria,
      linkExterno: post.linkExterno,
      conteudoFooter: post.conteudoFooter,
    });
    
    // Limpar imagens selecionadas
    setImageFiles({});
    setImagePreviews({});
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await postsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir post:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setImageFiles({});
    setImagePreviews({});
    setImageErrors({});
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setImageFiles({});
    setImagePreviews({});
    setImageErrors({});
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
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Gerencie os posts do sistema
                  </p>
                </div>
                {canManageContent() && (
                  <Button onClick={openCreateModal}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Novo Post
                  </Button>
                )}
              </div>

              {/* Filtro por categoria */}
              <div className="bg-white p-4 rounded-lg shadow">
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Categoria
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategory(value ? parseInt(value) : null);
                    setCurrentPage(1); // Resetar para primeira página ao filtrar
                  }}
                  className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.idCategoria} value={category.idCategoria}>
                      {category.nomeCategoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.idPost}>
                      <TableCell>{post.idPost}</TableCell>
                      <TableCell className="font-medium">{post.nomePost}</TableCell>
                      <TableCell className="max-w-xs">
                        {truncateText(post.descricao, 50)}
                      </TableCell>
                      <TableCell>{getUserName(post.idUsuario)}</TableCell>
                      <TableCell>{formatDate(post.dataPost)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(post.imagemPost, '_blank')}
                            title="Visualizar imagem"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          {canManageContent() && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(post)}
                                title="Editar post"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(post.idPost)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir post"
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
        title={editingPost ? 'Editar Post' : 'Novo Post'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Título do Post"
            {...register('nomePost')}
            error={errors.nomePost?.message}
            placeholder="Digite o título do post"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              {...register('descricao')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500 px-3 py-2 border"
              placeholder="Digite a descrição do post"
            />
            {errors.descricao && (
              <p className="text-sm text-red-600 mt-1">{errors.descricao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo Completo
            </label>
            <textarea
              {...register('conteudo')}
              rows={8}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500 px-3 py-2 border"
              placeholder="Digite o conteúdo completo do post (opcional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo Adicional
            </label>
            <textarea
              {...register('conteudoFooter')}
              rows={8}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500 px-3 py-2 border"
              placeholder="Digite o conteúdo adicional do post (opcional)"
            />
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
              <input
                type="text"
                value={currentUser?.nomeUsuario || 'Usuário não identificado'}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed sm:text-sm px-3 py-2 border"
              />
              <p className="text-xs text-gray-500 mt-1">
                O autor é automaticamente definido como o usuário logado
              </p>
            </div>
          </div>

          <Input
            label="Link Externo (opcional)"
            {...register('linkExterno')}
            placeholder="https://exemplo.com"
          />

          {/* Upload de Imagens */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Imagens (opcional)</h3>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Limite de tamanho:</strong> Máximo de 5MB por imagem
              </p>
            </div>
            
            {/* Imagem de Destaque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem de Destaque (topo do artigo)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('imagemDestaque', e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none px-3 py-2"
              />
              {imageErrors.imagemDestaque && (
                <p className="text-sm text-red-600 mt-1">{imageErrors.imagemDestaque}</p>
              )}
              {imagePreviews.imagemDestaque && !imageErrors.imagemDestaque && (
                <div className="mt-2">
                  <img src={imagePreviews.imagemDestaque} alt="Preview" className="h-32 w-auto rounded-lg border" />
                  {imageFiles.imagemDestaque && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tamanho: {formatFileSize(imageFiles.imagemDestaque.size)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Imagem do Conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem do Conteúdo (corpo do artigo)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('imagemConteudo', e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none px-3 py-2"
              />
              {imageErrors.imagemConteudo && (
                <p className="text-sm text-red-600 mt-1">{imageErrors.imagemConteudo}</p>
              )}
              {imagePreviews.imagemConteudo && !imageErrors.imagemConteudo && (
                <div className="mt-2">
                  <img src={imagePreviews.imagemConteudo} alt="Preview" className="h-32 w-auto rounded-lg border" />
                  {imageFiles.imagemConteudo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tamanho: {formatFileSize(imageFiles.imagemConteudo.size)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Imagem do Final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem do Final (fim do artigo)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('imagemFooter', e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none px-3 py-2"
              />
              {imageErrors.imagemFooter && (
                <p className="text-sm text-red-600 mt-1">{imageErrors.imagemFooter}</p>
              )}
              {imagePreviews.imagemFooter && !imageErrors.imagemFooter && (
                <div className="mt-2">
                  <img src={imagePreviews.imagemFooter} alt="Preview" className="h-32 w-auto rounded-lg border" />
                  {imageFiles.imagemFooter && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tamanho: {formatFileSize(imageFiles.imagemFooter.size)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingPost ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
