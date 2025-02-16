import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Suscribirse al rol en tiempo real
    this.authService.getRole$().subscribe(rol => {
      this.isAdmin = rol === 'admin';

      // Si el usuario ya no es admin, lo redirigimos al Home
      if (!this.isAdmin) {
        console.warn("⚠️ Ya no tienes permisos de admin. Redirigiendo...");
        this.router.navigate(['/home']);
      }
    });
  }
}
