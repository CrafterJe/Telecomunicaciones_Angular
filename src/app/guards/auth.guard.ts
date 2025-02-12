import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    // Si no es admin, lo mandamos a Home
    this.router.navigate(['/Home']);
    return false;
  }
}
