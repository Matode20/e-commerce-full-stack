import { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface representing an item in the shopping cart
 * @interface CartItem
 * @property {Product} product - The product details
 * @property {number} quantity - Number of this product in cart
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Interface defining the cart state and available actions
 * @interface CartState
 * @property {CartItem[]} items - Array of items in cart
 * @property {Function} addItem - Adds a product to cart
 * @property {Function} removeItem - Removes a product from cart
 * @property {Function} clearBasket - Empties the cart
 * @property {Function} getTotalPrice - Calculates total cart value
 * @property {Function} getItemCount - Gets quantity of specific item
 * @property {Function} getGroupedItems - Returns all cart items
 */
interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
}

/**
 * Creates a persistent cart store using Zustand
 * The store persists data in localStorage and provides methods to manage cart items
 */
const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initialize empty cart
      items: [],

      /**
       * Adds a product to cart or increments quantity if already exists
       * @param {Product} product - The product to add
       */
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

      /**
       * Decrements quantity of an item or removes it if quantity becomes 0
       * @param {string} productId - ID of product to remove
       */
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
          }, [] as CartItem[]),
        })),

      /**
       * Removes all items from cart
       */
      clearCart: () => set({ items: [] }),

      /**
       * Calculates total price of all items in cart
       * @returns {number} Total price
       */
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity,
          0
        );
      },

      /**
       * Gets the quantity of a specific product in cart
       * @param {string} productId - ID of product to check
       * @returns {number} Quantity of product in cart
       */
      getItemCount: (productId) => {
        const item = get().items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },

      /**
       * Returns all items in cart
       * @returns {CartItem[]} Array of cart items
       */
      getGroupedItems: () => get().items,
    }),
    {
      name: "Cart-store", // Storage key for localStorage
    }
  )
);

export default useCartStore;
