import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { apiService } from '@/services/api';

interface FavoritesState {
  favorites: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favorites: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{ success: boolean; data: Product[] }>('/favorites');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post<{ success: boolean; data: Product }>('/favorites', {
        productId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (productId: string, { rejectWithValue }) => {
    try {
      await apiService.delete<{ success: boolean; message: string }>(`/favorites/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (productId: string, { getState, dispatch }) => {
    const state = getState() as { favorites: FavoritesState };
    const isFavorite = state.favorites.favorites.some(fav => fav.id === productId);
    
    if (isFavorite) {
      return dispatch(removeFromFavorites(productId));
    } else {
      return dispatch(addToFavorites(productId));
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to Favorites
      .addCase(addToFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.favorites.find(fav => fav.id === action.payload.id)) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = state.favorites.filter(fav => fav.id !== action.payload);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearFavorites } = favoritesSlice.actions;

// Selectors
export const selectFavorites = (state: { favorites: FavoritesState }) => state.favorites.favorites;
export const selectIsFavorite = (state: { favorites: FavoritesState }, productId: string) =>
  state.favorites.favorites.some(fav => fav.id === productId);
export const selectFavoritesCount = (state: { favorites: FavoritesState }) => state.favorites.favorites.length;
export const selectFavoritesLoading = (state: { favorites: FavoritesState }) => state.favorites.isLoading;
export const selectFavoritesError = (state: { favorites: FavoritesState }) => state.favorites.error;

export default favoritesSlice.reducer;
