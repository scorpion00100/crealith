import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { User, LoginForm, RegisterForm, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activeMode: 'BUYER' | 'SELLER';
}

const initialState: AuthState = {
  user: null,
  token: null,
  // Always start unauthenticated and validate on app load to avoid stale sessions
  isAuthenticated: false,
  isLoading: false,
  error: null,
  activeMode: 'BUYER',
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginForm, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterForm, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        return { user: null, token: null, isAuthenticated: false };
      }
      
      // Vérifier si le token est valide en appelant le profil
      const profile = await authService.getProfile();
      return { user: profile, token, isAuthenticated: true };
    } catch (error: any) {
      // Si l'authentification échoue, nettoyer le localStorage
      authService.logout();
      return { user: null, token: null, isAuthenticated: false };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.activeMode = 'BUYER';
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setActiveMode: (state, action: PayloadAction<'BUYER' | 'SELLER'>) => {
      // Only sellers can switch to SELLER
      if (action.payload === 'SELLER' && state.user?.role !== 'SELLER') {
        state.activeMode = 'BUYER';
        localStorage.setItem('crealith_active_mode', 'BUYER');
        return;
      }
      state.activeMode = action.payload;
      localStorage.setItem('crealith_active_mode', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = (action.payload as any).accessToken || null;
        state.isAuthenticated = true;
        state.error = null;
        // Initialize activeMode based on role or storage
        const stored = localStorage.getItem('crealith_active_mode');
        if (stored === 'BUYER' || stored === 'SELLER') {
          state.activeMode = stored as any;
        } else {
          state.activeMode = action.payload.user.role === 'SELLER' ? 'SELLER' : 'BUYER';
          localStorage.setItem('crealith_active_mode', state.activeMode);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = (action.payload as any).accessToken || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        // Ensure activeMode remains valid
        if (state.activeMode === 'SELLER' && action.payload.role !== 'SELLER') {
          state.activeMode = 'BUYER';
          localStorage.setItem('crealith_active_mode', 'BUYER');
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
        
        // Set active mode based on user role
        if (action.payload.user) {
          const stored = localStorage.getItem('crealith_active_mode');
          if (stored === 'BUYER' || stored === 'SELLER') {
            state.activeMode = stored as any;
          } else {
            state.activeMode = action.payload.user.role === 'SELLER' ? 'SELLER' : 'BUYER';
            localStorage.setItem('crealith_active_mode', state.activeMode);
          }
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export const { setActiveMode } = authSlice.actions as any;
export default authSlice.reducer;