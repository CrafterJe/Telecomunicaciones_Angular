import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface CarritoProducto {
  _id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartserviceService {
  private apiUrl = 'http://127.0.0.1:5000/carrito';  // URL de tu backend

  constructor(private http: HttpClient) {}

  // Agregar producto al carrito
  agregarProducto(userId: string, producto: CarritoProducto) {
    return this.http.post(`${this.apiUrl}/${userId}`, { producto });  // Envía el producto al backend
  }

  // Obtener carrito desde el backend
  obtenerCarrito(userId: string) {
    return this.http.get<CarritoProducto[]>(`${this.apiUrl}/${userId}`);  // Obtiene los productos del carrito
  }
}
