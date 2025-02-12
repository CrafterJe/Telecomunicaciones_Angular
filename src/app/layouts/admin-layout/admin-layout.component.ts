import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], // 🚀 Importamos RouterOutlet
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
