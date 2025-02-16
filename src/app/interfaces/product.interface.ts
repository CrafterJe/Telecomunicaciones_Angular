export interface Producto {
  _id: string;
  nombre: string;
  tipo: string;
  precio: number;
  stock: number;
  especificaciones?: { [key: string]: string | number };
}
