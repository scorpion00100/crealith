import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  pageViews: number;
  userInteractions: number;
  searchQueries: string[];
  popularProducts: string[];
}

const initialState: AnalyticsState = {
  pageViews: 0,
  userInteractions: 0,
  searchQueries: [],
  popularProducts: [],
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    incrementPageView: (state) => {
      state.pageViews += 1;
    },
    incrementUserInteraction: (state) => {
      state.userInteractions += 1;
    },
    addSearchQuery: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim();
      if (query && !state.searchQueries.includes(query)) {
        state.searchQueries.unshift(query);
        // Garder seulement les 10 dernières recherches
        if (state.searchQueries.length > 10) {
          state.searchQueries = state.searchQueries.slice(0, 10);
        }
      }
    },
    addPopularProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (!state.popularProducts.includes(productId)) {
        state.popularProducts.unshift(productId);
        // Garder seulement les 10 produits les plus populaires
        if (state.popularProducts.length > 10) {
          state.popularProducts = state.popularProducts.slice(0, 10);
        }
      }
    },
    resetAnalytics: (state) => {
      state.pageViews = 0;
      state.userInteractions = 0;
      state.searchQueries = [];
      state.popularProducts = [];
    },
  },
});

export const {
  incrementPageView,
  incrementUserInteraction,
  addSearchQuery,
  addPopularProduct,
  resetAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;