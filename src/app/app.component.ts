import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './navegation/menu/menu.component';
import { AuthService } from './services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'telecom-compras';

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object // Inyectamos `platformId`
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();

      // Si hay un token y el usuario no está autenticado, lo eliminamos
      if (token && this.authService.isTokenExpired()) {
        console.warn("🔴 Token expirado después del reinicio. Eliminando...");
        this.authService.logout();
      }

      this.authService.checkTokenExpiration();
    }
  }

}
