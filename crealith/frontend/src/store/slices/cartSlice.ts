import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  subtotal: number;
  platformFee: number;
  isOpen: boolean;
  isLoading: boolean;
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
  setLoading
} = cartSlice.actions;

export default cartSlice.reducer;