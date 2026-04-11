import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  name: string;
  price: number;
  qty: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (name: string) => void;
  increaseQty: (name: string) => void;
  decreaseQty: (name: string) => void;

  total: () => number;
  count: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.name === item.name);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.name === item.name ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, qty: 1 }],
          });
        }
      },

      removeItem: (name) => {
        set({
          items: get().items.filter((i) => i.name !== name),
        });
      },

      increaseQty: (name) => {
        set({
          items: get().items.map((i) =>
            i.name === name ? { ...i, qty: i.qty + 1 } : i
          ),
        });
      },

      decreaseQty: (name) => {
        set({
          items: get()
            .items.map((i) =>
              i.name === name ? { ...i, qty: i.qty - 1 } : i
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