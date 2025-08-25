// Types pour l'application Crealith
export interface Product {
  id: string; // Changé de number à string pour correspondre aux données
  title: string;
  author: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  downloads?: number;
  image: string; // Ajouté pour ProductCard
  tags?: string[];
  popular?: boolean;
  new?: boolean;
  trending?: boolean;
  discount?: number;
  description?: string;
  // Ajouté pour compatibilité avec productSlice
  shortDescription?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  downloadsCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  categoryId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  averageRating?: number;
  totalSales?: number;
  totalReviews?: number;
  hasPurchased?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export interface User {
  id: string; // Changé de number à string
  firstName: string; // Ajouté pour Header
  lastName: string;  // Ajouté pour Header
  email: string;
  avatar?: string;
  isVendor?: boolean;
  // Garde pour compatibilité descendante
  name?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SearchFilters {
  category: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: 'popular' | 'price' | 'rating' | 'newest';
}

export type ViewMode = 'grid' | 'list';

// Types pour l'authentification
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string; // Optionnel car pas utilisé côté API
  accountType: 'buyer' | 'seller';
  agreeToTerms: boolean;
  newsletterOptIn: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Types pour les API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Types pour les filtres produits
export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: string;
}

// Types pour le dashboard
export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: string;
  totalDownloads: number;
}

export interface ActivityItem {
  id: number;
  type: 'sale' | 'download' | 'review' | 'upload';
  title: string;
  subtitle: string;
  amount?: string;
  time: string;
  status?: 'completed' | 'pending' | 'processing';
}
