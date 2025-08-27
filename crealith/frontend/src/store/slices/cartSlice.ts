import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, CartItem } from '@/types';
import { orderService } from '@/services/order.service';



interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  subtotal: number;
  platformFee: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

const PLATFORM_FEE_RATE = 0.05; // 5%

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  subtotal: 0,
  platformFee: 0,
  isOpen: false,
  isLoading: false,
  error: null,
};

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((total, item) => 
    total + (parseFloat(item.product.price) * item.quantity), 0
  );
  const platformFee = subtotal * PLATFORM_FEE_RATE;
  const totalAmount = subtotal + platformFee;
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return { subtotal, platformFee, totalAmount, totalItems };
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cartItems = await orderService.getCart();
      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cartItem = await orderService.addToCart(productId, quantity);
      return cartItem;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cartItem = await orderService.updateCartItem(id, quantity);
      return cartItem;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (id: string, { rejectWithValue }) => {
    try {
      await orderService.removeFromCart(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await orderService.clearCart();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id: product.id,
          product,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
      }
      
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
      
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      state.subtotal = 0;
      state.platformFee = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        const totals = calculateTotals(action.payload);
        Object.assign(state, totals);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to Cart
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingIndex >= 0) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Cart Item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from Cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Clear Cart
      .addCase(clearCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        const totals = calculateTotals([]);
        Object.assign(state, totals);
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  toggleCart,
  openCart,
  closeCart, 
  clearCart,
  setLoading,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer;