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
    // 🔥 Suscribirse a los cambios de rol en tiempo real
    this.authService.getRole$().subscribe(rol => {
      this.isAdmin = rol === 'admin';

      // 🔥 Si deja de ser admin, redirigir al home
      if (!this.isAdmin) {
        this.router.navigate(['/home']);
      }
    });
  }
}
