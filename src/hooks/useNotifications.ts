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
      
      // Carregar apenas comentários pendentes
      const commentsRes = await commentsAPI.getPending();
      const pendingComments = commentsRes?.comentarios || [];
      
      // Criar notificações apenas para comentários pendentes
      const commentNotifications: Notification[] = pendingComments.map((comment) => ({
        id: `comment-${comment.idComentario}`,
        type: 'comment' as const,
        title: 'Comentário pendente de aprovação',
        message: `"${comment.textoComentario.substring(0, 50)}${comment.textoComentario.length > 50 ? '...' : ''}" por ${comment.nomeAutor}`,
        timestamp: new Date(comment.dataComentario),
        read: false,
        actionUrl: '/comentarios',
      }));

      // Ordenar por timestamp (mais recentes primeiro)
      const allNotifications = commentNotifications
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Em caso de erro, limpar notificações
      setNotifications([]);
      setUnreadCount(0);
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

