import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService, SalesAnalytics, AdminAnalytics } from '@/services/analytics.service';

interface AnalyticsState {
  sellerAnalytics: SalesAnalytics | null;
  adminAnalytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  sellerAnalytics: null,
  adminAnalytics: null,
  isLoading: false,
  error: null,
};

export const fetchSellerAnalytics = createAsyncThunk(
  'analytics/fetchSellerAnalytics',
  async (period: 'week' | 'month' | 'year' = 'month') => {
    return await analyticsService.getSellerAnalytics(period);
  }
);

export const fetchAdminAnalytics = createAsyncThunk(
  'analytics/fetchAdminAnalytics',
  async (period: 'week' | 'month' | 'year' = 'month') => {
    return await analyticsService.getAdminAnalytics(period);
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalytics: (state) => {
      state.sellerAnalytics = null;
      state.adminAnalytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSellerAnalytics
      .addCase(fetchSellerAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellerAnalytics = action.payload;
      })
      .addCase(fetchSellerAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch seller analytics';
      })
      // fetchAdminAnalytics
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminAnalytics = action.payload;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch admin analytics';
      });
  },
});

export const { clearError, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
