'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { formatDate, truncateText } from '@/lib/utils';
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { commentsAPI, Comentario } from '@/lib/api';

export default function ComentariosPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComentario, setSelectedComentario] = useState<Comentario | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadComentarios();
  }, [isAuthenticated, router]);

  const loadComentarios = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getPending();
      setComentarios(response?.comentarios || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Tem certeza que deseja aprovar este comentário?')) return;

    try {
      await commentsAPI.approve(id);
      loadComentarios();
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      alert('Erro ao aprovar comentário');
    }
  };

  const openRejectModal = (comentario: Comentario) => {
    setSelectedComentario(comentario);
    setMotivoRejeicao('');
    setIsModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedComentario) return;
    if (!motivoRejeicao.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      await commentsAPI.reject(selectedComentario.idComentario, motivoRejeicao);
      
      setIsModalOpen(false);
      setSelectedComentario(null);
      setMotivoRejeicao('');
      loadComentarios();
    } catch (error) {
      console.error('Erro ao rejeitar comentário:', error);
      alert('Erro ao rejeitar comentário');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário permanentemente?')) return;

    try {
      await commentsAPI.delete(id);
      loadComentarios();
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      alert('Erro ao deletar comentário');
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
              <h1 className="text-2xl font-semibold text-gray-900">Moderação de Comentários</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie comentários pendentes de aprovação
              </p>
            </div>

            {comentarios.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-500 text-lg">
                  🎉 Nenhum comentário pendente de moderação!
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Todos os comentários foram moderados.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Comentário</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comentarios.map((comentario) => (
                      <TableRow key={comentario.idComentario}>
                        <TableCell>{comentario.idComentario}</TableCell>
                        <TableCell className="max-w-xs">
                          <span className="font-medium text-gray-900">
                            {comentario.nomePost || `Post #${comentario.idPost}`}
                          </span>
                        </TableCell>
                        <TableCell>{comentario.nomeAutor}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-gray-700">
                            {truncateText(comentario.textoComentario, 100)}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(comentario.dataComentario)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(comentario.idComentario)}
                              className="text-green-600 hover:text-green-700"
                              title="Aprovar comentário"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRejectModal(comentario)}
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Rejeitar comentário"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(comentario.idComentario)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir comentário"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Rejeição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComentario(null);
          setMotivoRejeicao('');
        }}
        title="Rejeitar Comentário"
      >
        <div className="space-y-4">
          {selectedComentario && (
            <>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Comentário:</p>
                <p className="text-sm text-gray-600">{selectedComentario.textoComentario}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Por: {selectedComentario.nomeAutor}
                </p>
              </div>

              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Rejeição *
                </label>
                <textarea
                  id="motivo"
                  rows={4}
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="Ex: Conteúdo ofensivo, spam, fora do contexto..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedComentario(null);
                    setMotivoRejeicao('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!motivoRejeicao.trim()}
                >
                  Rejeitar Comentário
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
