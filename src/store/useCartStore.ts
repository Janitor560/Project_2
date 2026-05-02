'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, DesignState } from '@/types';

interface CartStore {
  items: CartItem[];
  customerAddress: string;
  customerLat: number | null;
  customerLng: number | null;
  isExpressDelivery: boolean;

  addItem: (
    product: Product,
    quantity: number,
    customizations: Record<string, unknown>,
    design?: DesignState
  ) => void;
  removeItem:      (productId: string) => void;
  updateQuantity:  (productId: string, quantity: number) => void;
  clearCart:       () => void;
  setAddress:      (address: string, lat?: number, lng?: number) => void;
  setExpressDelivery: (val: boolean) => void;
  getTotalPrice:   () => number;
  getTotalItems:   () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerAddress: '',
      customerLat: null,
      customerLng: null,
      isExpressDelivery: false,

      addItem(product, quantity, customizations, design) {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            productId: product.id,
            product,
            quantity,
            unitPrice: product.basePrice,
            customizations,
            designSnapshot: design,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart() {
        set({ items: [], customerAddress: '', customerLat: null, customerLng: null });
      },

      setAddress(address, lat, lng) {
        set({ customerAddress: address, customerLat: lat ?? null, customerLng: lng ?? null });
      },

      setExpressDelivery(val) {
        set({ isExpressDelivery: val });
      },

      getTotalPrice() {
        return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      },

      getTotalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'awards-cart' }
  )
);
