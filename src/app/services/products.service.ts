import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

// Definir las interfaces en un archivo separado
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
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = API_URL;  // URL base

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/get_all`);
  }
}
