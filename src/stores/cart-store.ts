import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItem: (cartItemId: string, updatedData: Partial<CartItem>) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => {
        set((state) => ({ cart: [...state.cart, item] }));
      },
      removeFromCart: (cartItemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== cartItemId),
        }));
      },
      updateCartItem: (cartItemId, updatedData) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === cartItemId ? { ...item, ...updatedData } : item
          ),
        }));
      },
      clearCart: () => set({ cart: [] }),
      totalItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },
      totalPrice: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.price, 0);
      },
    }),
    {
      name: 'qordia-cart-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
