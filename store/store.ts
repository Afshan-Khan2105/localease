import { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BasketItem {
  product: Product;
  quantity: number;
}

interface BasketState {
  items: BasketItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string, removeAll?: boolean) => void;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => BasketItem[];
}

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          if (!product || !product._id) return state; // Defensive: skip if invalid product
          const existingItem = state.items.find(
            (item) => item.product && item.product._id === product._id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product && item.product._id === product._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity }] };
          }
        }),

      // removeItem: remove one or all of a product
      removeItem: (productId, removeAll = false) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product && item.product._id === productId) {
              if (removeAll || item.quantity <= 1) {
                // Remove the item completely
                return acc;
              } else {
                // Decrease quantity by 1
                return [...acc, { ...item, quantity: item.quantity - 1 }];
              }
            } else {
              return [...acc, item];
            }
          }, [] as BasketItem[]),
        })),

      clearBasket: () => set({ items: [] }),

      getTotalPrice: () => {
        return get()
          .getGroupedItems()
          .reduce((total, item) => {
            if (!item.product || typeof item.product.price !== "number")
              return total;
            return total + (item.product.price ?? 0) * item.quantity;
          }, 0);
      },

      getItemCount: (productId) => {
        const item = get().items.find((item) => item.product && item.product._id === productId);
        return item ? item.quantity : 0;
      },

      getGroupedItems: () => get().items,
    }),
    {
      name: "basket-store",
    }
  )
);

export default useBasketStore;
