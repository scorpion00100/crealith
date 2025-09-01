import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductFilters } from '@/types';
import { productService } from '@/services/product.service';

// État initial
interface ProductState {
  items: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  searchQuery: string;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
}

const initialState: ProductState = {
  items: [
    {
      id: '1',
      title: 'Dashboard Analytics Pro',
      author: 'Design Studio Pro',
      price: '29.99',
      originalPrice: '49.99',
      rating: 4.8,
      reviews: 127,
      downloads: 1250,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      tags: ['dashboard', 'analytics', 'admin', 'react'],
      popular: true,
      new: false,
      trending: true,
      discount: 40,
      description: 'Dashboard moderne et professionnel pour applications web avec graphiques interactifs et widgets personnalisables.',
      shortDescription: 'Dashboard analytics moderne avec graphiques interactifs',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      fileUrl: '/files/dashboard-analytics-pro.zip',
      fileSize: 15.2,
      fileType: 'zip',
      downloadsCount: 1250,
      isActive: true,
      isFeatured: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      userId: 'user1',
      categoryId: 'dashboard',
      user: {
        id: 'user1',
        firstName: 'Design',
        lastName: 'Studio Pro',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      category: {
        id: 'dashboard',
        name: 'Dashboards',
        slug: 'dashboards'
      },
      averageRating: 4.8,
      totalSales: 89,
      totalReviews: 127,
      hasPurchased: false
    },
    {
      id: '2',
      title: 'UI Kit Minimalist',
      author: 'Creative Design Lab',
      price: '19.99',
      rating: 4.6,
      reviews: 89,
      downloads: 890,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      tags: ['ui-kit', 'minimalist', 'design-system', 'figma'],
      popular: false,
      new: true,
      trending: false,
      discount: 0,
      description: 'Kit d\'interface utilisateur minimaliste avec composants modernes et système de design cohérent.',
      shortDescription: 'Kit UI minimaliste avec composants modernes',
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      fileUrl: '/files/ui-kit-minimalist.fig',
      fileSize: 8.5,
      fileType: 'fig',
      downloadsCount: 890,
      isActive: true,
      isFeatured: false,
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-12T16:20:00Z',
      userId: 'user2',
      categoryId: 'ui-kit',
      user: {
        id: 'user2',
        firstName: 'Creative',
        lastName: 'Design Lab',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      },
      category: {
        id: 'ui-kit',
        name: 'UI Kits',
        slug: 'ui-kits'
      },
      averageRating: 4.6,
      totalSales: 67,
      totalReviews: 89,
      hasPurchased: false
    },
    {
      id: '3',
      title: 'E-commerce Template',
      author: 'Web Solutions',
      price: '39.99',
      originalPrice: '59.99',
      rating: 4.9,
      reviews: 203,
      downloads: 2100,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      tags: ['e-commerce', 'template', 'shop', 'responsive'],
      popular: true,
      new: false,
      trending: true,
      discount: 33,
      description: 'Template e-commerce complet avec panier, paiement et gestion des produits intégrée.',
      shortDescription: 'Template e-commerce complet et responsive',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      fileUrl: '/files/ecommerce-template.zip',
      fileSize: 25.8,
      fileType: 'zip',
      downloadsCount: 2100,
      isActive: true,
      isFeatured: true,
      createdAt: '2024-01-05T11:45:00Z',
      updatedAt: '2024-01-18T13:30:00Z',
      userId: 'user3',
      categoryId: 'template',
      user: {
        id: 'user3',
        firstName: 'Web',
        lastName: 'Solutions',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      category: {
        id: 'template',
        name: 'Templates',
        slug: 'templates'
      },
      averageRating: 4.9,
      totalSales: 156,
      totalReviews: 203,
      hasPurchased: true
    },
    {
      id: '4',
      title: 'Mobile App Icons',
      author: 'Icon Master',
      price: '14.99',
      rating: 4.7,
      reviews: 156,
      downloads: 1800,
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      tags: ['icons', 'mobile', 'app', 'svg'],
      popular: false,
      new: false,
      trending: false,
      discount: 0,
      description: 'Collection complète d\'icônes pour applications mobiles avec formats SVG et PNG.',
      shortDescription: 'Collection d\'icônes pour applications mobiles',
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      fileUrl: '/files/mobile-app-icons.zip',
      fileSize: 12.3,
      fileType: 'zip',
      downloadsCount: 1800,
      isActive: true,
      isFeatured: false,
      createdAt: '2024-01-08T15:20:00Z',
      updatedAt: '2024-01-15T10:10:00Z',
      userId: 'user4',
      categoryId: 'icons',
      user: {
        id: 'user4',
        firstName: 'Icon',
        lastName: 'Master',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
      },
      category: {
        id: 'icons',
        name: 'Icons',
        slug: 'icons'
      },
      averageRating: 4.7,
      totalSales: 134,
      totalReviews: 156,
      hasPurchased: false
    }
  ],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {},
  searchQuery: '',
  pagination: {
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 12
  }
};

// Actions asynchrones
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters?: ProductFilters) => {
    const response = await productService.getProducts(filters);
    return response;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string) => {
    const response = await productService.getProductById(id);
    return response;
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string) => {
    // Pour l'instant, on utilise la recherche locale
    // TODO: Implémenter la recherche côté serveur
    return {
      products: [],
      page: 1,
      total: 0,
      totalPages: 0
    };
  }
);

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.unshift(action.payload);
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setPagination: (state, action: PayloadAction<{ page: number; total: number; totalPages: number; limit: number }>) => {
      state.pagination = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          limit: 12
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors du chargement des produits';
      })
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors du chargement du produit';
      })
      // searchProducts
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          limit: 12
        };
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la recherche';
      });
  }
});

// Recherche locale pour les produits
export const searchProductsLocal = (query: string) => {
  return (dispatch: any, getState: any) => {
    const state = getState();
    const products = state.products.items;
    
    if (!query.trim()) {
      return products;
    }

    const filteredProducts = products.filter((product: Product) => {
      const searchTerm = query.toLowerCase();
      return (
        product.title.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (product.user && product.user.firstName.toLowerCase().includes(searchTerm)) ||
        (product.user && product.user.lastName.toLowerCase().includes(searchTerm))
      );
    });

    return filteredProducts;
  };
};

export const {
  setFilters,
  setSearchQuery,
  clearFilters,
  setCurrentProduct,
  updateProduct,
  addProduct,
  removeProduct,
  setPagination
} = productSlice.actions;

export default productSlice.reducer;