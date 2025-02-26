export interface Producto {
  _id: string;
  nombre: string;
  tipo: string;
  precio: number;
  stock: number;
  especificaciones?: { [key: string]: string | number };
  imagenes?: {
    $binary: {
      base64: string;
      subType: string;
    };
  }[] | string[] | File[]; // Arreglo de imágenes en diferentes formatos

  video_link?: string; // Enlace de video de YouTube

  [key: string]: any; // Permitir el acceso dinámico a claves
}
