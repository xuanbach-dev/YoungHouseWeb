// User types
export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

// Post types
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

// Room types
export interface Room {
  RoomID: number;
  RoomNumber: string;
  Status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  RoomDescription?: string;
  BranchID: number;
  BranchName: string;
  Address: string;
  City: string;
  Phone?: string;
  RoomTypeID: number;
  TypeName: string;
  Price: number;
  TypeDescription?: string;
  Media?: RoomMedia[];
}

export interface RoomMedia {
  MediaID: number;
  FilePath: string;
  MediaType: string;
  UploadedAt: string;
}

export interface Branch {
  BranchID: number;
  BranchName: string;
  Address: string;
  City: string;
  Phone?: string;
}

export interface RoomType {
  RoomTypeID: number;
  TypeName: string;
  Price: number;
  Description?: string;
}

export interface RoomSearchFilters {
  searchQuery: string;
  branchId?: number;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
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

// Form types
export interface PostFormData {
  title: string;
  content: string;
  tags: string[];
}

export interface UserProfileFormData {
  username: string;
  bio: string;
  avatar: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface PostsContextType {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  fetchPosts: (page?: number, limit?: number) => Promise<void>;
  fetchPostById: (id: number) => Promise<void>;
  createPost: (data: PostFormData) => Promise<void>;
  updatePost: (id: number, data: Partial<PostFormData>) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
}