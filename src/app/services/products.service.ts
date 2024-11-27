import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Especificaciones {
  ram: number;
  procesador: string;
}

interface Producto {
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

  private apiUrl = 'http://127.0.0.1:4000/productos/get_all';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }
}
