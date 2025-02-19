import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

let sessionExpiredHandled = false; // Variable global para evitar múltiples alertas

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  if (typeof localStorage === 'undefined') {
    return next(req); // Si `localStorage` no está disponible, continuar sin token
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let clonedRequest = req;

  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    tap({
      error: (err) => {
        if ((err.status === 403 || (err.status === 401 && token)) && !sessionExpiredHandled) {
          sessionExpiredHandled = true;

          alert('⚠️ Tu sesión ha expirado. Inicia sesión nuevamente.');

          authService.logout();  // Llamar logout para limpiar sesión
          router.navigate(['/login']).then(() => {
            sessionExpiredHandled = false; // Permitir futuras redirecciones después del login
          });
        }
      }
    })
  );
};
