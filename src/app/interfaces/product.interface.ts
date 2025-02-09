// src/app/interfaces/producto.interface.ts
export interface Especificaciones {
  ram: number;
  procesador: string;
}

export interface Producto {
  _id: string;
  nombre: string;
  tipo: string;
  precio: number;
  especificaciones: Especificaciones;
  stock: number;
  cantidad?: number; // Para poder usar la propiedad cantidad en el carrito
}
