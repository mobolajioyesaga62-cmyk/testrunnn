import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  size: string;
  color: string;
  color_hex: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  sale_price?: number;
  image: string;
}

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      cart: [],
      wishlist: [],

      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find(i => i.variant_id === item.variant_id);
        if (existingItem) {
          return {
            cart: state.cart.map(i =>
              i.variant_id === item.variant_id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          };
        }
        return { cart: [...state.cart, item] };
      }),

      removeFromCart: (variantId) => set((state) => ({
        cart: state.cart.filter(item => item.variant_id !== variantId),
      })),

      updateCartQuantity: (variantId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.variant_id === variantId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
            : item
        ),
      })),

      clearCart: () => set({ cart: [] }),

      addToWishlist: (item) => set((state) => {
        if (!state.wishlist.find(i => i.product_id === item.product_id)) {
          return { wishlist: [...state.wishlist, item] };
        }
        return state;
      }),

      removeFromWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.filter(item => item.product_id !== productId),
      })),

      isInWishlist: (productId) => {
        return get().wishlist.some(item => item.product_id === productId);
      },

      cartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      cartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'fashion-store',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist }),
    }
  )
);
