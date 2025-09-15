import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

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
      // TODO: Implémenter l'API pour récupérer les favoris
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (productId: string, { rejectWithValue }) => {
    try {
      // TODO: Implémenter l'API pour ajouter/supprimer des favoris
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
      // toggleFavorite
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        const productId = action.payload;
        const existingIndex = state.items.findIndex(item => item.id === productId);
        if (existingIndex === -1) {
          // Ajouter aux favoris (on aurait besoin du produit complet)
          // Pour l'instant, on ne fait rien car on n'a que l'ID
        } else {
          // Retirer des favoris
          state.items.splice(existingIndex, 1);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
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