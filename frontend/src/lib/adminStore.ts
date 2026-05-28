import { repuestos as seedRepuestos } from "@/data/repuestos";
import type { Pedido, ProductoAdmin, SiteConfig } from "@/types/admin";

const KEYS = {
  productos: "elturco:productos",
  pedidos: "elturco:pedidos",
  config: "elturco:config",
  authAttempts: "elturco:authAttempts",
  authBlockedUntil: "elturco:authBlockedUntil",
  authSession: "elturco:authSession",
} as const;

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("elturco:store", { detail: { key } }));
}

// ---------- Productos ----------
export function getProductos(): ProductoAdmin[] {
  const stored = read<ProductoAdmin[] | null>(KEYS.productos, null);
  if (stored && stored.length) return stored;
  const initial: ProductoAdmin[] = seedRepuestos.map((r) => ({
    ...r,
    stock: r.enStock ? 10 : 0,
    activo: true,
  }));
  write(KEYS.productos, initial);
  return initial;
}

export function saveProductos(list: ProductoAdmin[]) {
  write(KEYS.productos, list);
}

export function upsertProducto(p: ProductoAdmin) {
  const list = getProductos();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.unshift(p);
  saveProductos(list);
}

export function deleteProducto(id: string): { ok: boolean; reason?: string } {
  const pedidos = getPedidos();
  const usado = pedidos.some((ped) => ped.items.some((i) => i.productoId === id));
  if (usado) {
    return {
      ok: false,
      reason: "Este producto está asociado a pedidos registrados. Sugerimos desactivarlo en lugar de eliminarlo.",
    };
  }
  saveProductos(getProductos().filter((p) => p.id !== id));
  return { ok: true };
}

export function toggleActivo(id: string) {
  const list = getProductos().map((p) => (p.id === id ? { ...p, activo: !p.activo } : p));
  saveProductos(list);
}

export function updateStock(id: string, stock: number) {
  const safe = Math.max(0, Math.floor(stock || 0));
  const list = getProductos().map((p) => (p.id === id ? { ...p, stock: safe } : p));
  saveProductos(list);
}

// ---------- Pedidos (seed demo) ----------
function seedPedidos(productos: ProductoAdmin[]): Pedido[] {
  if (productos.length < 3) return [];
  const mk = (
    n: string,
    daysAgo: number,
    nombre: string,
    tel: string,
    items: { idx: number; cant: number }[],
    estado: Pedido["estado"],
  ): Pedido => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const pedidoItems = items.map(({ idx, cant }) => {
      const p = productos[idx];
      return {
        productoId: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        marca: p.marca,
        precio: p.precio,
        cantidad: cant,
      };
    });
    return {
      id: crypto.randomUUID(),
      numero: n,
      fecha: d.toISOString(),
      cliente: { nombre, telefono: tel, email: `${nombre.toLowerCase().replace(/\s/g, ".")}@correo.cl` },
      items: pedidoItems,
      total: pedidoItems.reduce((s, i) => s + i.precio * i.cantidad, 0),
      estado,
    };
  };
  return [
    mk("P-1001", 1, "Carlos Pérez", "+56912345678", [{ idx: 0, cant: 2 }, { idx: 3, cant: 1 }], "pendiente"),
    mk("P-1002", 3, "María González", "+56987654321", [{ idx: 1, cant: 1 }], "preparando"),
    mk("P-1003", 5, "Juan Soto", "+56911223344", [{ idx: 5, cant: 1 }, { idx: 4, cant: 2 }], "listo"),
    mk("P-1004", 8, "Ana Rojas", "+56933445566", [{ idx: 7, cant: 2 }], "entregado"),
    mk("P-1005", 12, "Luis Muñoz", "+56955667788", [{ idx: 6, cant: 1 }, { idx: 2, cant: 2 }], "entregado"),
    mk("P-1006", 18, "Pedro Castro", "+56977889900", [{ idx: 0, cant: 1 }], "cancelado"),
  ];
}

export function getPedidos(): Pedido[] {
  const stored = read<Pedido[] | null>(KEYS.pedidos, null);
  if (stored) return stored;
  const seed = seedPedidos(getProductos());
  write(KEYS.pedidos, seed);
  return seed;
}

export function savePedidos(list: Pedido[]) {
  write(KEYS.pedidos, list);
}

export function updatePedidoEstado(id: string, estado: Pedido["estado"]) {
  savePedidos(getPedidos().map((p) => (p.id === id ? { ...p, estado } : p)));
}

// ---------- Config ----------
const DEFAULT_CONFIG: SiteConfig = {
  nombreNegocio: "Repuestos El Turco",
  direccion: "Av. Principal 1234, Local 5",
  telefono1: "+56 9 7742 4442",
  telefono2: "+56 9 6629 3400",
  whatsapp: "+56977424442",
  email: "contacto@repuestoselturco.cl",
  horario: "Lun-Vie 9:00-18:00 | Sáb 10:00-14:00",
  ciudad: "Santiago, Chile",
};

export function getConfig(): SiteConfig {
  return read<SiteConfig>(KEYS.config, DEFAULT_CONFIG);
}

export function saveConfig(c: SiteConfig) {
  write(KEYS.config, c);
}

// ---------- Auth ----------
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "turco2026";
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 60_000;

export interface AuthSession {
  user: string;
  loggedAt: number;
}

export function getSession(): AuthSession | null {
  return read<AuthSession | null>(KEYS.authSession, null);
}

export function logout() {
  if (!isBrowser) return;
  localStorage.removeItem(KEYS.authSession);
  window.dispatchEvent(new CustomEvent("elturco:store", { detail: { key: KEYS.authSession } }));
}

export function loginAttempt(user: string, pass: string): { ok: boolean; error?: string; bloqueoSeg?: number } {
  const blockedUntil = read<number>(KEYS.authBlockedUntil, 0);
  if (blockedUntil > Date.now()) {
    return {
      ok: false,
      error: "Demasiados intentos fallidos. Intenta nuevamente en unos segundos.",
      bloqueoSeg: Math.ceil((blockedUntil - Date.now()) / 1000),
    };
  }
  if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) {
    write(KEYS.authAttempts, 0);
    write(KEYS.authBlockedUntil, 0);
    write<AuthSession>(KEYS.authSession, { user, loggedAt: Date.now() });
    return { ok: true };
  }
  const attempts = read<number>(KEYS.authAttempts, 0) + 1;
  write(KEYS.authAttempts, attempts);
  if (attempts >= MAX_ATTEMPTS) {
    write(KEYS.authBlockedUntil, Date.now() + BLOCK_MS);
    write(KEYS.authAttempts, 0);
    return { ok: false, error: `Has superado los ${MAX_ATTEMPTS} intentos. Acceso bloqueado por 60 segundos.` };
  }
  return { ok: false, error: `Credenciales inválidas. Intentos restantes: ${MAX_ATTEMPTS - attempts}` };
}

// ---------- Reset (debug) ----------
export function resetAdminData() {
  if (!isBrowser) return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent("elturco:store", { detail: { key: "*" } }));
}

// ---------- Hook ----------
import { useEffect, useState } from "react";

export function useAdminStore<T>(getter: () => T): T {
  const [value, setValue] = useState<T>(getter);
  useEffect(() => {
    const handler = () => setValue(getter());
    window.addEventListener("elturco:store", handler as EventListener);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("elturco:store", handler as EventListener);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
