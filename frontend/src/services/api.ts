import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  
  getProfile: () => api.get('/auth/profile'),
};

// Users API
export const usersAPI = {
  getUsers: (page: number = 1, limit: number = 10) =>
    api.get(`/users?page=${page}&limit=${limit}`),
  
  getUserById: (id: number) => api.get(`/users/${id}`),
  
  searchUsers: (query: string) => api.get(`/users/search/${query}`),
  
  updateProfile: (id: number, data: any) => api.put(`/users/${id}`, data),
};

// Posts API
export const postsAPI = {
  getPosts: (page: number = 1, limit: number = 10, sortBy: string = 'createdAt', order: string = 'desc') =>
    api.get(`/posts?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`),
  
  getPostById: (id: number) => api.get(`/posts/${id}`),
  
  createPost: (data: { title: string; content: string; tags?: string[] }) =>
    api.post('/posts', data),
  
  updatePost: (id: number, data: { title?: string; content?: string; tags?: string[] }) =>
    api.put(`/posts/${id}`, data),
  
  deletePost: (id: number) => api.delete(`/posts/${id}`),
  
  likePost: (id: number) => api.post(`/posts/${id}/like`),
  
  searchPosts: (query: string) => api.get(`/posts/search/${query}`),
};

// Rooms API
export const roomsAPI = {
  getRooms: (page: number = 1, limit: number = 10, branchId?: number, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (branchId) params.append('branchId', branchId.toString());
    if (status) params.append('status', status);
    return api.get(`/rooms?${params.toString()}`);
  },
  
  getRoomById: (id: number) => api.get(`/rooms/${id}`),
  
  getAvailableRoomsByBranch: (branchId: number) => api.get(`/rooms/available/${branchId}`),
  
  searchRooms: (query: string, branchId?: number) => {
    const params = branchId ? `?branchId=${branchId}` : '';
    return api.get(`/rooms/search/${encodeURIComponent(query)}${params}`);
  },
  
  createRoom: (data: { branchId: number; roomTypeId: number; roomNumber: string; status?: string; description?: string }) =>
    api.post('/rooms', data),
  
  updateRoom: (id: number, data: { branchId: number; roomTypeId: number; roomNumber: string; status?: string; description?: string }) =>
    api.put(`/rooms/${id}`, data),
  
  updateRoomStatus: (id: number, status: string) =>
    api.patch(`/rooms/${id}/status`, { status }),
  
  deleteRoom: (id: number) => api.delete(`/rooms/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;