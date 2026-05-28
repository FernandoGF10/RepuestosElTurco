import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import type { ProductoAdmin } from "@/types/admin";

export type CartItem = { producto: ProductoAdmin; cantidad: number };

interface CartContextType {
  items: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (producto: ProductoAdmin) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((producto: ProductoAdmin) => {
    if (producto.stock === 0) {
      toast.error("Este repuesto no tiene stock disponible.");
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.producto.id === producto.id);
      if (existing) return prev.map((i) => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto, cantidad: 1 }];
    });
    setCartOpen(true);
    toast.success(`${producto.nombre} agregado al carrito.`);
  }, []);

  const increase = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => i.producto.id === id ? { ...i, cantidad: i.cantidad + 1 } : i));
  }, []);

  const decrease = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => i.producto.id === id ? { ...i, cantidad: i.cantidad - 1 } : i).filter((i) => i.cantidad > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const count = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, cartOpen, setCartOpen, addItem, increase, decrease, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
