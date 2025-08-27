import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchService, SearchFilters, SearchResult } from '@/services/search.service';
import { Product } from '@/types';

interface SearchState {
  searchResults: SearchResult | null;
  suggestions: string[];
  popularSearches: string[];
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  currentFilters: SearchFilters;
}

const initialState: SearchState = {
  searchResults: null,
  suggestions: [],
  popularSearches: [],
  relatedProducts: [],
  isLoading: false,
  error: null,
  currentFilters: {},
};

export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (filters: SearchFilters) => {
    return await searchService.searchProducts(filters);
  }
);

export const getSearchSuggestions = createAsyncThunk(
  'search/getSearchSuggestions',
  async (query: string) => {
    return await searchService.getSearchSuggestions(query);
  }
);

export const getPopularSearches = createAsyncThunk(
  'search/getPopularSearches',
  async () => {
    return await searchService.getPopularSearches();
  }
);

export const getRelatedProducts = createAsyncThunk(
  'search/getRelatedProducts',
  async (productId: string) => {
    return await searchService.getRelatedProducts(productId);
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.currentFilters = {};
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // searchProducts
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search products';
      })
      // getSearchSuggestions
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      // getPopularSearches
      .addCase(getPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload;
      })
      // getRelatedProducts
      .addCase(getRelatedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRelatedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(getRelatedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch related products';
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearSearchResults, 
  clearSuggestions, 
  clearError 
} = searchSlice.actions;

export default searchSlice.reducer;
