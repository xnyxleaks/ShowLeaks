export interface Model {
  id: number;
  name: string;
  photoUrl: string;
  bio: string;
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
  bustSize?: string;
  height?: number;
  weight?: number;
  age?: number;
  birthPlace?: string;
  ethnicity?: 'arab' | 'asian' | 'ebony' | 'indian' | 'latina' | 'white';
  orientation?: string;
  tags: string[];
  views: number;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contentCount?: number;
}

export interface Content {
  id: number;
  modelId: number;
  title: string;
  url: string;
  thumbnailUrl?: string;
  type: 'video' | 'image' | 'gallery';
  tags: string[];
  views: number;
  status: 'active' | 'broken' | 'reported' | 'removed';
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  model?: Model;
}

export interface Report {
  id: number;
  contentId?: number;
  modelId?: number;
  userId?: number;
  reason: 'broken_link' | 'child_content' | 'no_consent' | 'spam' | 'inappropriate' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'recent' | 'popular';
export type AdNetwork = 'linkvertise' | 'admaven';

export interface User {
  id: number;
  name: string;
  email: string;
  profilePhoto?: string;
  isVerified: boolean;
  language: string;
  country?: string;
  ageConfirmed: boolean;
  lastLoginAt?: string;
  isPremium: boolean;
  isAdmin: boolean;
  expiredPremium: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  language?: string;
  country?: string;
  ageConfirmed: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FilterOptions {
  ethnicity?: string;
  minAge?: number;
  maxAge?: number;
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
  tags?: string[];
  search?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  data?: T;
  models?: Model[];
  contents?: Content[];
  reports?: Report[];
  comments?: Comment[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

export interface Comment {
  id: number;
  userId: number;
  contentId?: number;
  modelId?: number;
  text: string;
  likes: number;
  isLiked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    isPremium: boolean;
    isAdmin: boolean;
  };
}

export interface Like {
  id: number;
  userId: number;
  contentId?: number;
  modelId?: number;
  type: 'content' | 'model';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'comment_like' | 'comment_reply' | 'model_follow' | 'content_like';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}