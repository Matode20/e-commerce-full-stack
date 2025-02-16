import { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Defines the structure for items in the shopping basket
export interface BasketItem {
  product: Product;
  quantity: number;
}

// Defines the state and actions available in the basket store
interface BasketState {
  items: BasketItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => BasketItem[];
}

// Create a persistent store using Zustand
const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      // Initial state with empty basket
      items: [],

      // Add item to basket or increase quantity if already exists
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product._id === product._id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity: 1 }] };
          }
        }),

      // Remove one quantity of an item or remove completely if quantity is 1
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product._id === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as BasketItem[]),
        })),

      // Clear all items from basket
      clearBasket: () => set({ items: [] }),

      // Calculate total price of all items in basket
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity,
          0
        );
      },

      // Get quantity of specific item in basket
      getItemCount: (productId) => {
        const item = get().items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },

      // Get all items in basket
      getGroupedItems: () => get().items,
    }),
    {
      // Persist store in localStorage with this key
      name: "Basket-store",
    }
  )
);

export default useBasketStore;
