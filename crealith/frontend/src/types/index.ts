// Types pour l'application Crealith
export interface Product {
  id: string;
  title: string;
  author: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  downloads?: number;
  image: string;
  tags?: string[];
  popular?: boolean;
  new?: boolean;
  trending?: boolean;
  discount?: number;
  description?: string;
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
  // Propriétés pour compatibilité
  salesCount?: number;
  reviewCount?: number;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatar?: string;
  bio?: string;
  stripeAccountId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Garde pour compatibilité descendante
  isVendor?: boolean;
  name?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  createdAt: string;
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

// Types pour les commandes
export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  stripePaymentId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  createdAt: string;
  product: Product;
}

// Types pour les avis
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  productId: string;
  user?: User;
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
