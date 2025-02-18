import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { API_URL } from '../config/api.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('❌ No hay token en localStorage. Asegúrate de haber iniciado sesión.');
      throw new Error("No hay token disponible");
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // 🔹 Obtener total de usuarios y productos
  getTotalUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios/total`, { headers: this.getHeaders() });
  }

  getTotalProductos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/productos/total`, { headers: this.getHeaders() });
  }

  // 🔹 Obtener usuarios
  getUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios`, { headers: this.getHeaders() });
  }

  // 🔹 Actualizar rol de usuario
  actualizarRol(id: string, nuevoRol: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("❌ No hay token disponible");
      return throwError(() => new Error("No hay token disponible"));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    //console.log(`📤 Enviando petición para cambiar rol: Usuario ID ${id}, Nuevo Rol: ${nuevoRol}`);

    return this.http.put<any>(`${this.apiUrl}/admin/usuarios/${id}/rol`, { rol: nuevoRol }, { headers });
  }

  // Eliminar usuario
  deleteUsuario(id: string): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('❌ No hay token en localStorage. Asegúrate de haber iniciado sesión.');
      alert("Error: No hay token disponible. Inicia sesión nuevamente.");
      return throwError(() => new Error("No hay token disponible"));
    }

    console.log(`🔑 Token enviado en DELETE`);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    /*console.log(`📤 Enviando DELETE a: ${this.apiUrl}/admin/usuarios/${id}`);*/

    return this.http.delete<any>(`${this.apiUrl}/admin/usuarios/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error("❌ Error al eliminar usuario:", error);
        alert("Hubo un problema al eliminar el usuario. Revisa la consola.");
        return throwError(() => new Error("Error al eliminar usuario"));
      })
    );
  }

  // Obtener productos
  getProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/productos`, { headers: this.getHeaders() });
  }
  addProduct(productData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/productos`, productData, { headers: this.getHeaders() });
}
  // Método corregido para actualizar producto
  updateProduct(id: string, productData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    //console.log(`📤 Enviando PUT a: ${this.apiUrl}/admin/productos/${id}`, productData);

    return this.http.put<any>(`${this.apiUrl}/admin/productos/${id}`, productData, { headers });
  }


  // Método para eliminar producto
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/productos/${id}`, { headers: this.getHeaders() });
  }
}
