import { Injectable,Inject,PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject,interval,of,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config/api.config';
import { switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_URL;
  private usernameSubject = new BehaviorSubject<string | null>(null);
  private roleSubject = new BehaviorSubject<string | null>(null); // Para el rol

  constructor(private http: HttpClient,
    private router: Router,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeUserState();
    this.initializeRole(); // Inicializa el estado al cargar el servicio
  }

  isTokenExpired(): boolean {
    if (typeof localStorage === 'undefined') {
      return true; // Si localStorage no está disponible, asumir que el token ha expirado
    }

    const token = this.getToken();
    if (!token) {
      return true; // No hay token, así que está "expirado"
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp < currentTime) {
        console.warn("⚠️ Token expirado, eliminando...");
        this.logout();  // Eliminar el token al instante
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error al decodificar el token:", error);
      this.logout();  // Si hay error en el token, también eliminarlo
      return true;
    }
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

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private getRolFromBackend(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/rol`, { headers: this.getHeaders() }).pipe(
      switchMap(response => {
        if (response?.rol && response.rol !== this.getUserRole()) {
          console.warn("⚠️ El rol ha cambiado, actualizando...");
          this.saveToLocalStorage('rol', response.rol);
          this.roleSubject.next(response.rol);
        }
        return of(response);
      }),
      catchError(error => {
        console.error("❌ Error al obtener el rol:", error);
        return of(null); // No hacer que la aplicación crashee
      })
    );
  }
  public updateRolUsuario(): void {
    this.getRolFromBackend().subscribe();
  }


  /**
   * Guardar datos en `localStorage` (con verificación)
   */
  private saveToLocalStorage(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    } else {
      console.warn(`No se pudo guardar "${key}" en localStorage.`);
    }
  }

  /**
   * Obtener datos de `localStorage` (con verificación)
   */
  private getFromLocalStorage(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
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
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
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
  getRole$(): Observable<string | null> {
    return this.roleSubject.asObservable();
  }

  /**
   * Sincronizar el rol con localStorage y notificar a los componentes
   */
  private initializeRole(): void {
    const rol = this.getUserRole();
    this.roleSubject.next(rol);
  }

  /**
   * Actualizar el rol en tiempo real (usado después de login o cambios en la BD)
   */
  refreshUserRole(): void {
    this.http.get<any>(`${this.apiUrl}/auth/rol`).subscribe(
      (response) => {
        localStorage.setItem('rol', response.rol);
        this.roleSubject.next(response.rol);
      },
      (error) => {
        console.error('Error al obtener el rol del usuario:', error);
      }
    );
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

      this.getRolFromBackend().subscribe();

    } catch (error) {
      console.error('Error al procesar el token en handleLogin:', error);
    }

  }

  /**
   * Cerrar sesión y limpiar el estado
   */

  private clearSession(): void {
    this.removeFromLocalStorage('token');
    this.removeFromLocalStorage('username');
    this.removeFromLocalStorage('userId');
    this.removeFromLocalStorage('rol');
    this.removeFromLocalStorage('carrito');
    this.usernameSubject.next(null);
    this.roleSubject.next(null);
}

logout(): void {
  this.clearSession();
  console.log("🔴 Sesión cerrada. Redirigiendo a Home...");
  this.router.navigate(['/Home']);
}

logoutExpiredSession(): void {
  this.clearSession();
  this.cartService.resetCart();
  console.warn("⚠️ Sesión expirada. Redirigiendo a Login...");
  this.router.navigate(['/login']).then(() => {
    console.log("🔄 Redireccionando...");
});
}


  checkTokenExpiration(): void {
    if (!isPlatformBrowser(this.platformId)) return; // Evita ejecutar en SSR

    const token = this.getToken();
    if (!token) return;

    if (this.isTokenExpired()) {
      if (typeof alert !== 'undefined') {
        alert('⚠️ Tu sesión ha expirado. Inicia sesión nuevamente.');
      }
      this.logoutExpiredSession();
    }
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
  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }

}
