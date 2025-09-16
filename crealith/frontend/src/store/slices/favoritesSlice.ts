import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { favoritesService } from '@/services/favorites.service';

interface FavoritesState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const items = await favoritesService.getFavorites();
      return items;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFavoriteAsync = createAsyncThunk(
  'favorites/addFavorite',
  async (productId: string, { rejectWithValue }) => {
    try {
      await favoritesService.add(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFavoriteAsync = createAsyncThunk(
  'favorites/removeFavorite',
  async (productId: string, { rejectWithValue }) => {
    try {
      await favoritesService.remove(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === product.id);
      if (existingIndex === -1) {
        state.items.push(product);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearFavorites: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFavorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // addFavorite
      .addCase(addFavoriteAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFavoriteAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Note: pour ajouter, il faudrait le produit complet. Ici on laisse l'état tel quel; l'UI se rafraîchit via refetch si besoin.
      })
      .addCase(addFavoriteAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // removeFavorite
      .addCase(removeFavoriteAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const productId = action.payload as string;
        state.items = state.items.filter(item => item.id !== productId);
      })
      .addCase(removeFavoriteAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  clearError,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;