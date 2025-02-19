import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { MenuComponent } from './navegation/menu/menu.component';
import { AuthService } from './services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenuComponent, RouterOutlet], // ✅ Agregamos RouterOutlet aquí
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'telecom-compras';
  private routerSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inyectamos `platformId`
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Verificar el token al cargar la aplicación
      this.checkSession();

      // Suscribirse a cambios de ruta para verificar el token en cada navegación
      this.routerSubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.checkSession();
        }
      });
    }
  }

  private checkSession(): void {
    const token = this.authService.getToken();

    // Si hay un token y el usuario no está autenticado, eliminarlo y cerrar sesión
    if (token && this.authService.isTokenExpired()) {
      console.warn("🔴 Token expirado. Cerrando sesión...");
      alert("⚠️ Tu sesión ha expirado. Inicia sesión nuevamente.");
      this.authService.logoutExpiredSession();
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
