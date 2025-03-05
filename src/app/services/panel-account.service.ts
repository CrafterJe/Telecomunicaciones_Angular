import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PanelAccountService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let token = '';

    // Verificar si estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || '';
    } else {
      console.warn("⚠️ localStorage no está disponible (SSR o servidor). Se omite el token.");
    }

    if (!token) {
      console.error("❌ No hay token en localStorage. Es posible que el usuario no haya iniciado sesión.");
    } else {
      console.log("🔑 Token encontrado:", token);
    }

    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '', // Si no hay token, envía un string vacío
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }





  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/panel_acc/get-profile`, { headers: this.getHeaders() });
  }

  updateNombre(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/panel_acc/update-profile/nombre`, data, { headers: this.getHeaders() });
  }


  updateUsuario(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/panel_acc/update-profile/usuario`, data, { headers: this.getHeaders() });
  }

  updateEmail(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/panel_acc/update-profile/email`, data, { headers: this.getHeaders() });
  }

  updatePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/panel_acc/update-profile/password`, data, { headers: this.getHeaders() });
  }
}
