import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: {
    size?: string;
    sizeVariantId?: number;
    packagingColor?: string;
    addCard?: boolean;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Проверяем, есть ли уже товар с таким же SKU и опциями
          const existingIndex = state.items.findIndex(
            (i) =>
              i.sku === item.sku &&
              JSON.stringify(i.options) === JSON.stringify(item.options)
          );

          if (existingIndex > -1) {
            // Увеличиваем количество
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
            return { items: newItems };
          } else {
            // Добавляем новый товар
            return { items: [...state.items, item] };
          }
        });
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
        }));
      },

      updateQuantity: (sku, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.sku === sku ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => {
            let itemPrice = item.price;
            // Добавляем цену опций
            if (item.options?.addCard) {
              itemPrice += 5; // Цена открытки
            }
            return total + itemPrice * item.quantity;
          },
          0
        );
      },
    }),
    {
      name: 'izabels-cart-storage',
    }
  )
);
