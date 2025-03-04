import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../interfaces/user.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre: string = '';
  apellidoP: string = '';
  apellidoM: string = '';
  usuario: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    const user: User = {
      nombre: this.nombre,
      apellidoP: this.apellidoP,
      apellidoM: this.apellidoM?.trim() || '',
      usuario: this.usuario,
      email: this.email,
      password: this.password,
      fecha_registro: new Date().toISOString(),
      direcciones: []  // Se envía como array vacío si no hay direcciones
    };

    this.authService.register(user).subscribe({
      next: () => {
        alert('Usuario registrado exitosamente');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al registrar usuario', err);
        alert('Error al registrar usuario');
      }
    });
  }
}
