import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:4000';  // URL de tu backend para login y registro

  constructor(private http: HttpClient) {}

  login(credentials: { usuario: string, password: string }): Observable<any> {
    console.log('Enviando request a:', `${this.apiUrl}/login`);
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
}

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);  // Enviar los datos al backend para registrar al usuario
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
