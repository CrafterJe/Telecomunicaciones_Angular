import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './account-layout.component.html',
  styleUrls: ['./account-layout.component.css']
})
export class AccountLayoutComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // 🔒 Verificar autenticación sin hacer llamadas al backend
    this.isAuthenticated = this.authService.isAuthenticated();

    // ⛔ Si no hay sesión iniciada, redirigir a login
    if (!this.isAuthenticated) {
      console.warn("⚠️ No tienes sesión iniciada. Redirigiendo a login...");
      this.router.navigate(['/Home']);
    }
  }
}
