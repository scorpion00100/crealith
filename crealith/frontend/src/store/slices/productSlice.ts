import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductFilters } from '@/types';
import { productService } from '@/services/product.service';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  categories: string[];
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  searchResults: Product[];
  isSearching: boolean;
}

// Données mock pour développement
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Pack Templates E-commerce Premium',
    description: 'Collection complète de templates e-commerce modernes et responsives. Inclut 15 designs différents avec code source complet, documentation et fichiers Figma.',
    shortDescription: 'Templates e-commerce premium avec code source complet',
    price: '99.99',
    originalPrice: '149.99',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    fileUrl: '/downloads/ecommerce-templates.zip',
    fileSize: 45000000,
    fileType: 'application/zip',
    downloadsCount: 1250,
    tags: ['templates', 'e-commerce', 'react', 'nextjs', 'tailwind'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    userId: 'u1',
    categoryId: 'c1',
    user: {
      id: 'u1',
      firstName: 'Marie',
      lastName: 'Dupont',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: 'c1', name: 'Templates Web', slug: 'templates-web' },
    averageRating: 4.8,
    totalSales: 1250,
    totalReviews: 89,
    hasPurchased: false
  },
  {
    id: '2',
    title: 'Dashboard Analytics React',
    description: 'Dashboard complet avec graphiques interactifs, gestion des utilisateurs et analytics avancées. Construit avec React, TypeScript et D3.js.',
    shortDescription: 'Dashboard React avec analytics et graphiques',
    price: '79.99',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    fileUrl: '/downloads/dashboard-analytics.zip',
    fileSize: 32000000,
    fileType: 'application/zip',
    downloadsCount: 890,
    tags: ['dashboard', 'analytics', 'react', 'd3js', 'typescript'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    userId: 'u2',
    categoryId: 'c2',
    user: {
      id: 'u2',
      firstName: 'Jean',
      lastName: 'Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: 'c2', name: 'Dashboards', slug: 'dashboards' },
    averageRating: 4.6,
    totalSales: 890,
    totalReviews: 67,
    hasPurchased: false
  },
  {
    id: '3',
    title: 'UI Kit Mobile App Design',
    description: 'Kit complet d\'éléments UI pour applications mobiles. Plus de 200 composants et 50 écrans prêts à utiliser avec fichiers Sketch et Figma.',
    shortDescription: 'Kit UI complet pour applications mobiles',
    price: '59.99',
    originalPrice: '89.99',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    fileUrl: '/downloads/mobile-ui-kit.zip',
    fileSize: 28000000,
    fileType: 'application/zip',
    downloadsCount: 654,
    tags: ['ui-kit', 'mobile', 'design', 'figma', 'sketch'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
    userId: 'u3',
    categoryId: 'c3',
    user: {
      id: 'u3',
      firstName: 'Sophie',
      lastName: 'Bernard',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: 'c3', name: 'UI Kits', slug: 'ui-kits' },
    averageRating: 4.7,
    totalSales: 654,
    totalReviews: 45,
    hasPurchased: true
  },
  {
    id: '4',
    title: 'Landing Page Templates',
    description: 'Collection de 12 landing pages modernes et convertissantes pour différents secteurs d\'activité.',
    shortDescription: 'Landing pages modernes et convertissantes',
    price: '49.99',
    thumbnailUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
    fileUrl: '/downloads/landing-pages.zip',
    fileSize: 22000000,
    fileType: 'application/zip',
    downloadsCount: 423,
    tags: ['landing-page', 'marketing', 'conversion', 'html', 'css'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-02-01T16:20:00Z',
    updatedAt: '2024-02-01T16:20:00Z',
    userId: 'u4',
    categoryId: 'c1',
    user: {
      id: 'u4',
      firstName: 'Lucas',
      lastName: 'Moreau',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: 'c1', name: 'Templates Web', slug: 'templates-web' },
    averageRating: 4.3,
    totalSales: 423,
    totalReviews: 28,
    hasPurchased: false
  }
];

const initialState: ProductState = {
  products: mockProducts,
  selectedProduct: null,
  categories: ['Templates Web', 'Dashboards', 'UI Kits', 'Mobile Apps'],
  filters: {},
  pagination: {
    page: 1,
    limit: 12,
    total: mockProducts.length,
    totalPages: Math.ceil(mockProducts.length / 12),
  },
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(id);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    searchProducts: (state, action: PayloadAction<string>) => {
      state.isSearching = true;
      const query = action.payload.toLowerCase();
      if (query.trim()) {
        state.searchResults = state.products.filter(product =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query)) ||
          product.user.firstName.toLowerCase().includes(query) ||
          product.user.lastName.toLowerCase().includes(query)
        );
      } else {
        state.searchResults = [];
      }
      state.isSearching = false;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedProduct,
  setFilters,
  clearFilters,
  searchProducts,
  clearSearchResults,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;