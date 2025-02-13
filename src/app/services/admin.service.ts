import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token en localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTotalUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios/total`, { headers: this.getHeaders() });
  }

  getTotalProductos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/productos/total`, { headers: this.getHeaders() });
  }

  getUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios`, { headers: this.getHeaders() });
  }

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

    console.log(`📤 Enviando petición para cambiar rol: Usuario ID ${id}, Nuevo Rol: ${nuevoRol}`);

    return this.http.put<any>(`${this.apiUrl}/admin/usuarios/${id}/rol`, { rol: nuevoRol }, { headers });
  }


  deleteUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/usuarios/${id}`, { headers: this.getHeaders() });
  }
}
