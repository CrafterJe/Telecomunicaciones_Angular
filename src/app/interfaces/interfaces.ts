// interfaces.ts
export interface Producto {
  _id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
}

export interface Carrito {
  _id: string;
  usuario_id: string;
  productos: Producto[];
  total: number;
  fecha_creacion: string;
}
