export type EstadoPedido = "pendiente" | "preparando" | "listo" | "entregado" | "cancelado";

export interface ProductoAdmin {
  id: string;
  codigo: string;
  nombre: string;
  familia_id?: number;
  subfamilia_id?: number;
  familia_nombre?: string;
  subfamilia_nombre?: string;
  marca: string;
  precio: number;
  descripcion: string;
  detalle: string;
  compatibilidad: { auto: string; anios: string }[];
  imagen: string;
  stock: number;
  activo: boolean;
}

export interface PedidoItem {
  productoId: string;
  codigo: string;
  nombre: string;
  marca: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  numero: string;
  fecha: string; // ISO
  cliente: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  items: PedidoItem[];
  total: number;
  estado: EstadoPedido;
  notas?: string;
}

export interface SiteConfig {
  nombreNegocio: string;
  direccion: string;
  telefono1: string;
  telefono2: string;
  whatsapp: string;
  email: string;
  horario: string;
  ciudad: string;
}
