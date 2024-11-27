import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    const credentials = {
      usuario: this.username,  // Cambiar 'username' a 'usuario'
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (data) => {
        // Guardar el token JWT en el localStorage
        localStorage.setItem('token', data.token);
        this.router.navigate(['/home']);  // Ajusta la ruta a tu página principal
      },
      error: (err) => {
        console.error('Error de login', err);
        alert('Usuario o contraseña incorrectos.');
      }
    });
  }
}
