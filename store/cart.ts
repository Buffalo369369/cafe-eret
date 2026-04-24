import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;

  total: () => number;
  count: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, qty: 1 }],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
        });
      },

      increaseQty: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          ),
        });
      },

      decreaseQty: (id) => {
        set({
          items: get()
            .items.map((i) =>
              i.id === id ? { ...i, qty: i.qty - 1 } : i
            )
            .filter((i) => i.qty > 0),
        });
      },

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      count: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);