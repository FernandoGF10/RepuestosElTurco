import amortiguadorImg from "@/assets/products/amortiguador.png";
import radiadorImg from "@/assets/products/radiador-calefaccion.png";
import terminalImg from "@/assets/products/terminal-direccion.png";
import pastillasImg from "@/assets/products/pastillas-freno.png";
import filtroImg from "@/assets/products/filtro-aceite.png";
import bobinaImg from "@/assets/products/bobina-encendido.png";
import correaImg from "@/assets/products/correa-distribucion.png";
import discoImg from "@/assets/products/disco-freno.png";
import type { ProductoAdmin, Pedido, PedidoItem, SiteConfig } from "@/types/admin";

// ─── Fallback images for seeded products (backend stores no image URL) ──────
const LOCAL_IMAGES: Record<string, string> = {
  "AMG-001": amortiguadorImg,
  "RAD-002": radiadorImg,
  "TDD-003": terminalImg,
  "PFR-004": pastillasImg,
  "FLT-005": filtroImg,
  "BBA-006": bobinaImg,
  "CRR-007": correaImg,
  "DSF-008": discoImg,
};

function resolveImage(codigo: string, imagenUrl: string): string {
  if (imagenUrl) return imagenUrl;
  return LOCAL_IMAGES[codigo] ?? "/placeholder.svg";
}

// ─── Token management ────────────────────────────────────────────────────────
const TOKEN_KEY = "elturco:token";
const USERNAME_KEY = "elturco:username";

export const token = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (t: string, username: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USERNAME_KEY, username);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },
  getUsername: (): string => localStorage.getItem(USERNAME_KEY) ?? "admin",
};

// ─── Base fetch wrapper ──────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const jwt = token.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    token.clear();
    window.location.href = "/admin/login";
    throw new Error("Sesión expirada");
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.detail ?? `Error ${res.status}`);
  }
  return body as T;
}

// ─── Raw API types (snake_case from backend) ─────────────────────────────────
interface RawProducto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  descripcion: string;
  detalle: string;
  compatibilidad: { auto: string; anios: string }[];
  imagen_url: string;
  stock: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

interface RawPedidoItem {
  id: string;
  producto_id: string;
  codigo: string;
  nombre: string;
  marca: string;
  precio: number;
  cantidad: number;
}

interface RawPedido {
  id: string;
  numero: string;
  fecha: string;
  estado: Pedido["estado"];
  cliente: { nombre: string; telefono: string; email: string };
  items: RawPedidoItem[];
  total: number;
  notas: string;
}

interface RawConfig {
  nombre_negocio: string;
  direccion: string;
  telefono1: string;
  telefono2: string;
  whatsapp: string;
  email: string;
  horario: string;
  ciudad: string;
}

// ─── Transformers ────────────────────────────────────────────────────────────
function toProducto(r: RawProducto): ProductoAdmin {
  return {
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    categoria: r.categoria,
    marca: r.marca,
    precio: r.precio,
    descripcion: r.descripcion,
    detalle: r.detalle,
    compatibilidad: r.compatibilidad,
    imagen: resolveImage(r.codigo, r.imagen_url),
    stock: r.stock,
    activo: r.activo,
  };
}

function toPedido(r: RawPedido): Pedido {
  return {
    id: r.id,
    numero: r.numero,
    fecha: r.fecha,
    estado: r.estado,
    cliente: r.cliente,
    items: r.items.map((i): PedidoItem => ({
      productoId: i.producto_id,
      codigo: i.codigo,
      nombre: i.nombre,
      marca: i.marca,
      precio: i.precio,
      cantidad: i.cantidad,
    })),
    total: r.total,
    notas: r.notas,
  };
}

function toConfig(r: RawConfig): SiteConfig {
  return {
    nombreNegocio: r.nombre_negocio,
    direccion: r.direccion,
    telefono1: r.telefono1,
    telefono2: r.telefono2,
    whatsapp: r.whatsapp,
    email: r.email,
    horario: r.horario,
    ciudad: r.ciudad,
  };
}

function fromConfig(c: SiteConfig): Partial<RawConfig> {
  return {
    nombre_negocio: c.nombreNegocio,
    direccion: c.direccion,
    telefono1: c.telefono1,
    telefono2: c.telefono2,
    whatsapp: c.whatsapp,
    email: c.email,
    horario: c.horario,
    ciudad: c.ciudad,
  };
}

// ─── API methods ─────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const data = await request<{ access_token: string; username: string }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ username, password }) },
      );
      token.set(data.access_token, data.username);
      return data;
    },
    me: () => request<{ username: string }>("/api/auth/me"),
    logout: () => token.clear(),
  },

  productos: {
    list: async (params?: {
      categoria?: string;
      buscar?: string;
      solo_activos?: boolean;
    }): Promise<ProductoAdmin[]> => {
      const q = new URLSearchParams();
      if (params?.categoria && params.categoria !== "Todos")
        q.set("categoria", params.categoria);
      if (params?.buscar) q.set("buscar", params.buscar);
      if (params?.solo_activos !== undefined)
        q.set("solo_activos", String(params.solo_activos));
      const raw = await request<RawProducto[]>(`/api/productos?${q}`);
      return raw.map(toProducto);
    },

    get: async (id: string): Promise<ProductoAdmin> => {
      const raw = await request<RawProducto>(`/api/productos/${id}`);
      return toProducto(raw);
    },

    create: async (data: Omit<ProductoAdmin, "id">): Promise<ProductoAdmin> => {
      const body = { ...data, imagen_url: data.imagen };
      const raw = await request<RawProducto>("/api/productos", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return toProducto(raw);
    },

    update: async (id: string, data: Partial<Omit<ProductoAdmin, "id">>): Promise<ProductoAdmin> => {
      const body = { ...data, ...(data.imagen !== undefined ? { imagen_url: data.imagen } : {}) };
      const raw = await request<RawProducto>(`/api/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      return toProducto(raw);
    },

    updateStock: async (id: string, stock: number): Promise<ProductoAdmin> => {
      const raw = await request<RawProducto>(`/api/productos/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock }),
      });
      return toProducto(raw);
    },

    toggle: async (id: string): Promise<ProductoAdmin> => {
      const raw = await request<RawProducto>(`/api/productos/${id}/toggle`, {
        method: "PATCH",
      });
      return toProducto(raw);
    },

    delete: (id: string) =>
      request<void>(`/api/productos/${id}`, { method: "DELETE" }),
  },

  pedidos: {
    list: async (params?: {
      estado?: string;
      buscar?: string;
    }): Promise<Pedido[]> => {
      const q = new URLSearchParams();
      if (params?.estado) q.set("estado", params.estado);
      if (params?.buscar) q.set("buscar", params.buscar);
      const raw = await request<RawPedido[]>(`/api/pedidos?${q}`);
      return raw.map(toPedido);
    },

    create: async (data: {
      cliente: { nombre: string; telefono: string; email?: string };
      items: {
        producto_id: string;
        codigo: string;
        nombre: string;
        marca: string;
        precio: number;
        cantidad: number;
      }[];
      notas?: string;
    }): Promise<Pedido> => {
      const raw = await request<RawPedido>("/api/pedidos", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return toPedido(raw);
    },

    updateEstado: async (id: string, estado: Pedido["estado"]): Promise<Pedido> => {
      const raw = await request<RawPedido>(`/api/pedidos/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
      });
      return toPedido(raw);
    },
  },

  clientes: {
    list: async (buscar?: string) => {
      const q = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
      return request<{
        nombre: string;
        telefono: string;
        email: string;
        total_pedidos: number;
        total_gastado: number;
        ultimo_pedido: string;
      }[]>(`/api/clientes${q}`);
    },
  },

  reportes: {
    get: (desde: string, hasta: string) =>
      request<{
        total_ventas: number;
        cant_pedidos: number;
        ticket_promedio: number;
        total_unidades: number;
        top_productos: {
          producto_id: string;
          codigo: string;
          nombre: string;
          cantidad: number;
          total: number;
        }[];
      }>(`/api/reportes?desde=${desde}&hasta=${hasta}`),
  },

  config: {
    get: async (): Promise<SiteConfig> => {
      const raw = await request<RawConfig>("/api/config");
      return toConfig(raw);
    },
    update: async (data: SiteConfig): Promise<SiteConfig> => {
      const raw = await request<RawConfig>("/api/config", {
        method: "PUT",
        body: JSON.stringify(fromConfig(data)),
      });
      return toConfig(raw);
    },
  },

  token,
};
