import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_URL } from '../config/api.config';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_URL;
  private carritoSubject = new BehaviorSubject<any>({ productos: [], total: 0 });

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token en localStorage. Asegúrate de haber iniciado sesión.');
      throw new Error('No hay token disponible');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // ✅ Evita problemas con preflight request (OPTIONS)
    });
  }



  getCartItems(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/carrito/${userId}`, { headers: this.getAuthHeaders() }).pipe(
      tap((carrito) => {
        carrito.subtotal = parseFloat(carrito.subtotal.toFixed(2));
        carrito.total = parseFloat(carrito.total.toFixed(2));
        this.carritoSubject.next(carrito);
      })
    );
  }

  initializeCart(userId: string): void {
    this.getCartItems(userId).subscribe({
      next: (carrito) => this.carritoSubject.next(carrito),
      error: () => this.carritoSubject.next({ productos: [], total: 0 })
    });
  }

  agregarAlCarrito(userId: string, productoId: string, cantidad: number): Observable<any> {
    const url = `${this.apiUrl}/carrito/agregar`;
    const body = { userId, productoId, cantidad };
    return this.http.post<any>(url, body, { headers: this.getAuthHeaders() }).pipe(
      tap((response) => {
        if (response && response.message === "error_controlado") {
          alert(`⚠️ ${response.error}`);
        } else {
          this.getCartItems(userId).subscribe();
        }
      }),
      catchError(() => of(null))
    );
  }

  eliminarProducto(userId: string, productoId: string): Observable<any> {
    const url = `${this.apiUrl}/carrito/${userId}/producto/${productoId}`;
    return this.http.delete<any>(url, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.getCartItems(userId).subscribe()),
      catchError((error) => {
        console.error('❌ Error al eliminar el producto:', error);
        // Check for specific CORS or network errors
        if (error.status === 0) {
          console.error('Posible error de CORS o de red. Verifica la configuración del servidor.');
        }
        return throwError(() => new Error('Error al eliminar el producto. Intenta de nuevo.'));
      })
    );
  }



  actualizarCantidadProducto(userId: string, productoId: string, cantidad: number): Observable<any> {
    const url = `${this.apiUrl}/carrito/actualizar`;
    const body = { usuario_id: userId, producto_id: productoId, cantidad };
    return this.http.post<any>(url, body, { headers: this.getAuthHeaders() }).pipe(
      tap((response) => {
        if (response && response.message === "error_controlado") {
          alert(`⚠️ ${response.error}`);
        } else if (response && response.carrito) {
          this.carritoSubject.next(response.carrito);
        }
      }),
      catchError(() => of(null))
    );
  }

  recalcularTotal(): void {
    const carrito = this.carritoSubject.getValue();
    const total = carrito.productos.reduce((acc: number, producto: any) => {
      return acc + producto.precio * producto.cantidad;
    }, 0);
    this.carritoSubject.next({ ...carrito, total });
  }

  getCarrito$(): Observable<any> {
    return this.carritoSubject.asObservable();
  }

  resetCart(): void {
    this.carritoSubject.next({ productos: [], total: 0 });
  }
}
