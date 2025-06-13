import { create } from "zustand";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderStore = {
  orderId: string | null;
  items: OrderItem[];
  total: number;
  setOrder: (id: string, items: OrderItem[], total: number) => void;
  clearOrder: () => void;
};

export const useOrderStore = create<OrderStore>((set) => ({
  orderId: null,
  items: [],
  total: 0,
  setOrder: (orderId, items, total) => set({ orderId, items, total }),
  clearOrder: () => set({ orderId: null, items: [], total: 0 }),
}));
