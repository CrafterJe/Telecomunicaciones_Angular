import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,RouterLink, RouterLinkActive],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre: string = '';  // Nombre completo
  usuario: string = '';  // Nombre de usuario
  email: string = '';  // Correo electrónico
  password: string = '';  // Contraseña

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    const user = {
      nombre: this.nombre,
      usuario: this.usuario,
      email: this.email,
      password: this.password,  // La contraseña en texto plano
      tipo: 'cliente',  // El tipo de usuario, en este caso "cliente"
      fecha_registro: new Date().toISOString()  // Fecha actual en formato ISO
    };

    // Llamada al servicio de registro
    this.authService.register(user).subscribe({
      next: (data) => {
        console.log('Usuario registrado exitosamente');
        this.router.navigate(['/login']);  // Redirigir al login
      },
      error: (err) => {
        console.error('Error al registrar usuario', err);
        alert('Error al registrar usuario');
      }
    });
  }
}
