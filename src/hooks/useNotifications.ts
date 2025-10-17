import { useState, useEffect, useCallback } from 'react';
import { commentsAPI, usersAPI, categoriesAPI, postsAPI, videosAPI } from '@/lib/api';

export interface Notification {
  id: string;
  type: 'comment' | 'user' | 'post' | 'video' | 'category';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar comentários pendentes
      const commentsRes = await commentsAPI.getPending();
      const pendingComments = commentsRes?.comentarios || [];
      
      // Criar notificações para comentários pendentes
      const commentNotifications: Notification[] = pendingComments.map((comment, index) => ({
        id: `comment-${comment.idComentario}`,
        type: 'comment' as const,
        title: 'Novo comentário para aprovação',
        message: `"${comment.textoComentario.substring(0, 50)}..." por ${comment.nomeAutor}`,
        timestamp: new Date(comment.dataComentario),
        read: false,
        actionUrl: '/comentarios',
      }));

      // Carregar estatísticas para criar notificações de atividade recente
      const [usersRes, categoriesRes, postsRes, videosRes] = await Promise.all([
        usersAPI.getAll(1, 1).catch(() => ({ pagination: { totalUsuarios: 0 } })),
        categoriesAPI.getAll(1, 1).catch(() => ({ pagination: { totalCategorias: 0 } })),
        postsAPI.getAll(1, 1).catch(() => ({ pagination: { totalPosts: 0 } })),
        videosAPI.getAll(1, 1).catch(() => ({ pagination: { totalVideos: 0 } })),
      ]);

      // Criar notificações de atividade (simuladas para demonstração)
      const activityNotifications: Notification[] = [
        {
          id: 'activity-users',
          type: 'user',
          title: 'Usuários cadastrados',
          message: `${usersRes?.pagination?.totalUsuarios || 0} usuários no sistema`,
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
          read: false,
          actionUrl: '/usuarios',
        },
        {
          id: 'activity-posts',
          type: 'post',
          title: 'Posts publicados',
          message: `${postsRes?.pagination?.totalPosts || 0} posts no sistema`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          read: false,
          actionUrl: '/posts',
        },
        {
          id: 'activity-videos',
          type: 'video',
          title: 'Vídeos adicionados',
          message: `${videosRes?.pagination?.totalVideos || 0} vídeos no sistema`,
          timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 horas atrás
          read: false,
          actionUrl: '/videos',
        },
      ];

      // Combinar todas as notificações e ordenar por timestamp
      const allNotifications = [...commentNotifications, ...activityNotifications]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    
    // Recarregar notificações a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  };
}
