export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  pais: string;
}

export interface User {
  nombre: string;
  apellidoP: string;
  apellidoM?: string;
  usuario: string;
  email: string;
  password: string;
  fecha_registro: string;
  direcciones: Direccion[]; 
}
