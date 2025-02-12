import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_URL;
  private usernameSubject = new BehaviorSubject<string | null>(null);
  private roleSubject = new BehaviorSubject<string | null>(null); // Para el rol

  constructor(private http: HttpClient) {
    this.initializeUserState(); // Inicializa el estado al cargar el servicio
  }

  /**
   * Verificar si `localStorage` está disponible
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Guardar datos en `localStorage` (con verificación)
   */
  private saveToLocalStorage(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      console.warn(`No se pudo guardar "${key}" en localStorage.`);
    }
  }

  /**
   * Obtener datos de `localStorage` (con verificación)
   */
  getFromLocalStorage(key: string): string | null {
    return this.isLocalStorageAvailable() ? localStorage.getItem(key) : null;
  }

  /**
   * Eliminar datos de `localStorage` (con verificación)
   */
  private removeFromLocalStorage(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Método para iniciar sesión
   */
  login(credentials: { usuario: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      catchError((error) => {
        console.error('Error en el login:', error);
        return throwError(() => new Error('Credenciales inválidas. Intenta nuevamente.'));
      })
    );
  }

  /**
   * Método para registrar un nuevo usuario
   */
  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      catchError((error) => {
        console.error('Error en el registro:', error);
        alert('Error en el registro: ' + (error.error?.error || 'Verifica los datos ingresados'));
        return throwError(() => new Error('Error en el registro. Intenta nuevamente.'));
      })
    );
  }


  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getFromLocalStorage('token') !== null;
  }

  /**
   * Obtener el token almacenado
   */
  getToken(): string | null {
    return this.getFromLocalStorage('token');
  }

  /**
   * Decodificar el token JWT
   */
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  /**
   * Obtener el observable del `username`
   */
  getUsername$(): Observable<string | null> {
    return this.usernameSubject.asObservable();
  }

  /**
   * Obtener el observable del `rol`
   */
  getUserRole$(): Observable<string | null> {
    return this.roleSubject.asObservable();
  }

  /**
   * Método para obtener el rol del usuario
   */
  getUserRole(): string {
    return this.getFromLocalStorage('rol') || 'usuario'; // Por defecto, usuario
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  /**
   * Manejar el inicio de sesión y actualizar el estado
   */
  handleLogin(token: string): void {
    this.saveToLocalStorage('token', token);

    try {
      const decodedToken: any = this.decodeToken(token);
      const username = decodedToken?.nombre || 'Usuario';
      const userId = decodedToken?.user_id;
      const rol = decodedToken?.rol || 'usuario'; // Si no tiene rol, se asigna usuario

      if (username) {
        this.saveToLocalStorage('username', username);
        this.usernameSubject.next(username);
      }

      if (userId) {
        this.saveToLocalStorage('userId', userId);
      }

      if (rol) {
        this.saveToLocalStorage('rol', rol);
        this.roleSubject.next(rol);
      }
    } catch (error) {
      console.error('Error al procesar el token en handleLogin:', error);
    }
  }

  /**
   * Cerrar sesión y limpiar el estado
   */
  logout(): void {
    this.removeFromLocalStorage('token');
    this.removeFromLocalStorage('username');
    this.removeFromLocalStorage('userId');
    this.removeFromLocalStorage('rol'); // Eliminamos el rol

    this.usernameSubject.next(null);
    this.roleSubject.next(null);
    window.location.href = '/Home';
  }

  /**
   * Inicializar el `username` y `rol` desde el token o `localStorage`
   */
  private initializeUserState(): void {
    try {
      const username = this.getFromLocalStorage('username');
      const rol = this.getFromLocalStorage('rol');

      if (username) {
        this.usernameSubject.next(username);
      } else {
        const token = this.getToken();
        if (token) {
          const decodedToken = this.decodeToken(token);
          const usernameFromToken = decodedToken?.nombre || null;
          this.usernameSubject.next(usernameFromToken);
        }
      }

      if (rol) {
        this.roleSubject.next(rol);
      } else {
        const token = this.getToken();
        if (token) {
          const decodedToken = this.decodeToken(token);
          const roleFromToken = decodedToken?.rol || 'usuario';
          this.roleSubject.next(roleFromToken);
        }
      }
    } catch (error) {
      console.error('Error al inicializar el estado del usuario:', error);
    }
  }
}
