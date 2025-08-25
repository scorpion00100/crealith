import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  duration?: number;
}

interface UIState {
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  searchQuery: string;
  notifications: Notification[];
  theme: 'light' | 'dark';
  showSearchResults: boolean;
  currentPage: string;
  breadcrumbs: Array<{ label: string; path: string }>;
}

const initialState: UIState = {
  isLoading: false,
  isMobileMenuOpen: false,
  searchQuery: '',
  notifications: [],
  theme: 'light',
  showSearchResults: false,
  currentPage: 'home',
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.showSearchResults = action.payload.length > 0;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
      state.showSearchResults = false;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: action.payload.duration || 4000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    setShowSearchResults: (state, action: PayloadAction<boolean>) => {
      state.showSearchResults = action.payload;
    },
  },
});

export const {
  setLoading,
  toggleMobileMenu,
  closeMobileMenu,
  setSearchQuery,
  clearSearchQuery,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  setCurrentPage,
  setBreadcrumbs,
  setShowSearchResults,
} = uiSlice.actions;

export default uiSlice.reducer;