import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { API_URL } from '../config/api.config';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_URL;
  //private apiUrl = 'http://localhost:5000';

  // BehaviorSubject para mantener el estado del carrito
  private carritoSubject = new BehaviorSubject<any>({ productos: [], total: 0 });

  constructor(private http: HttpClient) {}

  // Método para obtener los productos del carrito
  getCartItems(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/carrito/${userId}`).pipe(
      tap((carrito) => {
        this.carritoSubject.next(carrito); // Actualiza el BehaviorSubject
      })
    );
  }

  // Método para inicializar el carrito desde el inicio
  initializeCart(userId: string): void {
    this.getCartItems(userId).subscribe({
      next: (carrito) => this.carritoSubject.next(carrito),
      error: (error) => {
        console.error('Error al inicializar el carrito:', error);
        this.carritoSubject.next({ productos: [], total: 0 }); // Fallback a un carrito vacío
      }
    });
  }

  // Método para agregar productos al carrito
  agregarAlCarrito(userId: string, productoId: string, cantidad: number): Observable<any> {
    const url = `${this.apiUrl}/carrito/agregar`;
    const body = { userId, productoId, cantidad };

    return this.http.post<any>(url, body).pipe(
      tap(() => {
        // Actualiza el carrito después de agregar un producto
        this.getCartItems(userId).subscribe();
      })
    );
  }

  // Método para eliminar un producto del carrito
  eliminarProducto(userId: string, productoId: string): Observable<any> {
    const url = `${this.apiUrl}/carrito/${userId}/producto/${productoId}`;
    return this.http.delete<any>(url).pipe(
      tap(() => {
        // Actualiza el carrito después de eliminar un producto
        this.getCartItems(userId).subscribe();
      })
    );
  }

  // Método para actualizar la cantidad de un producto
  actualizarCantidadProducto(userId: string, productoId: string, cantidad: number): Observable<any> {
    const url = `${this.apiUrl}/carrito/actualizar`;
    const body = { usuario_id: userId, producto_id: productoId, cantidad };

    return this.http.post<any>(url, body).pipe(
      tap((carritoActualizado) => {
        if (carritoActualizado && carritoActualizado.productos) {
          this.carritoSubject.next(carritoActualizado); // Emite el carrito actualizado
        } else {
          console.error('Respuesta no válida del backend:', carritoActualizado);
        }
      }),
      catchError((error) => {
        console.error('Error al actualizar la cantidad:', error);
        return of(this.carritoSubject.getValue()); // Devuelve el último valor conocido
      })
    );
  }


  // Método para recalcular el total del carrito
  recalcularTotal() {
    const carrito = this.carritoSubject.getValue();
    const total = carrito.productos.reduce((acc: number, producto: any) => {
      return acc + producto.precio * producto.cantidad;
    }, 0);

    // Actualiza el BehaviorSubject con el nuevo total
    this.carritoSubject.next({ ...carrito, total });
  }

  // Getter para obtener el estado del carrito
  getCarrito$(): Observable<any> {
    return this.carritoSubject.asObservable();
  }
}
