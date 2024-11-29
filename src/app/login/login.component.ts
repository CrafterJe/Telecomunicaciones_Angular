import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  login(): void {
    if (!this.username || !this.password) {
      alert('Por favor, complete ambos campos.');
      return;
    }

    const credentials = {
      usuario: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);

        // Manejar el token y extraer datos del usuario
        const token = response.token;
        this.authService.handleLogin(token);

        // Inicializar el carrito tras el login
        const userId = localStorage.getItem('userId');
        if (userId) {
          this.cartService.initializeCart(userId);
        }

        // Redirigir a la página de inicio
        alert('Inicio de sesión exitoso');
        this.router.navigate(['/Home']);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.error = 'Credenciales inválidas. Intenta nuevamente.';
        alert(this.error); // Mostrar el error al usuario
      }
    });
  }
}
