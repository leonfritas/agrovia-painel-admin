import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://5acfae47b7cd.ngrok-free.app/api';

// Configurar axios com interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos de dados
export interface User {
  idUsuario: number;
  nomeUsuario: string;
  ativoAdm: boolean;
}

export interface Category {
  idCategoria: number;
  nomeCategoria: string;
}

export interface Post {
  idPost: number;
  nomePost: string;
  descricao: string;
  conteudo?: string;
  idCategoria: number;
  dataPost: string;
  idUsuario: number;
  imagemPost?: string;
  imagemDestaque?: string;
  imagemConteudo?: string;
  linkExterno?: string;
  categoria?: Category;
  usuario?: User;
}

export interface Video {
  idVideo: number;
  nomeVideo: string;
  urlArquivo?: string;
  urlExterno?: string;
  descricao: string;
  idUsuario: number;
  dataUpload: string;
  idCategoria: number;
  categoria?: Category;
  usuario?: User;
}

export interface LoginResponse {
  message: string;
  usuario: User;
  token: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API de autenticação
export const authAPI = {
  login: async (nomeUsuario: string, senhaUsuario: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { nomeUsuario, senhaUsuario });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// API de usuários
export const usersAPI = {
  getAll: async (page = 1, limit = 10, type?: string): Promise<{ usuarios: User[]; pagination: { currentPage: number; totalPages: number; totalUsuarios: number; hasNext: boolean; hasPrev: boolean } }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<{ usuario: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: { nomeUsuario: string; senhaUsuario: string; ativoAdm?: boolean }): Promise<{ message: string; usuario: User }> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<{ message: string; usuario: User }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleAdmin: async (id: number): Promise<{ message: string; usuario: User }> => {
    const response = await api.put(`/users/${id}/toggle-admin`);
    return response.data;
  },
};

// API de categorias
export const categoriesAPI = {
  getAll: async (page = 1, limit = 10, search?: string): Promise<{ categorias: Category[]; pagination: { currentPage: number; totalPages: number; totalCategorias: number; hasNext: boolean; hasPrev: boolean } }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response = await api.get(`/categorias?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<{ categoria: Category }> => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  create: async (data: { nomeCategoria: string }): Promise<{ message: string; categoria: Category }> => {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  update: async (id: number, data: { nomeCategoria: string }): Promise<{ message: string; categoria: Category }> => {
    const response = await api.put(`/categorias/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    try {
      console.log('API: Tentando excluir categoria ID:', id);
      
      // Primeiro, verificar se a categoria está sendo usada em posts ou vídeos
      try {
        const [postsRes, videosRes] = await Promise.all([
          api.get(`/posts?categoria=${id}&limit=1`).catch(() => ({ data: { posts: [] } })),
          api.get(`/videos?categoria=${id}&limit=1`).catch(() => ({ data: { videos: [] } }))
        ]);
        
        const postsUsingCategory = postsRes.data?.posts || [];
        const videosUsingCategory = videosRes.data?.videos || [];
        
        if (postsUsingCategory.length > 0) {
          throw new Error('Esta categoria está sendo usada em posts e não pode ser excluída.');
        }
        
        if (videosUsingCategory.length > 0) {
          throw new Error('Esta categoria está sendo usada em vídeos e não pode ser excluída.');
        }
      } catch (checkError: any) {
        if (checkError.message.includes('sendo usada')) {
          throw checkError;
        }
        // Se não for erro de uso, continuar com a exclusão
      }
      
      const response = await api.delete(`/categorias/${id}`);
      console.log('API: Resposta da exclusão:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Erro ao excluir categoria:', {
        id,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error;
    }
  },
};

// API de posts
export const postsAPI = {
  getAll: async (page = 1, limit = 10, search?: string): Promise<{ posts: Post[]; pagination: { currentPage: number; totalPages: number; totalPosts: number; hasNext: boolean; hasPrev: boolean } }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response = await api.get(`/posts?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<{ post: Post }> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: FormData | Partial<Post>): Promise<{ message: string; post: Post }> => {
    // Quando é FormData, deixar o axios definir o Content-Type automaticamente
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': undefined }
    } : {};
    const response = await api.post('/posts', data, config);
    return response.data;
  },

  update: async (id: number, data: FormData | Partial<Post>): Promise<{ message: string; post: Post }> => {
    // Quando é FormData, deixar o axios definir o Content-Type automaticamente
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': undefined }
    } : {};
    const response = await api.put(`/posts/${id}`, data, config);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};

// API de vídeos
export const videosAPI = {
  getAll: async (page = 1, limit = 10, search?: string): Promise<{ videos: Video[]; pagination: { currentPage: number; totalPages: number; totalVideos: number; hasNext: boolean; hasPrev: boolean } }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response = await api.get(`/videos?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<{ video: Video }> => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  create: async (data: Partial<Video>): Promise<{ message: string; video: Video }> => {
    const response = await api.post('/videos', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Video>): Promise<{ message: string; video: Video }> => {
    const response = await api.put(`/videos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },
};

// Tipos para comentários
export interface Comentario {
  idComentario: number;
  idPost: number;
  nomeAutor: string;
  textoComentario: string;
  dataComentario: string;
  aprovado: boolean;
  moderado: boolean;
  motivoRejeicao?: string;
  nomePost?: string;
}

// API de comentários
export const commentsAPI = {
  getPending: async (): Promise<{ comentarios: Comentario[] }> => {
    const response = await api.get('/comentarios/pending');
    return response.data;
  },

  approve: async (id: number): Promise<{ message: string }> => {
    const response = await api.put(`/comentarios/${id}/approve`);
    return response.data;
  },

  reject: async (id: number, motivo: string): Promise<{ message: string }> => {
    const response = await api.put(`/comentarios/${id}/reject`, { motivo });
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/comentarios/${id}`);
    return response.data;
  },
};

export default api;
