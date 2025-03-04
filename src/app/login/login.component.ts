import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

declare var grecaptcha: any;

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

    // Obtener el token de reCAPTCHA
    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
      alert('Por favor, completa el reCAPTCHA.');
      return;
    }

    const credentials = {
      usuario: this.username,
      password: this.password,
      captcha: captchaResponse  // Enviar el token de reCAPTCHA al backend
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.authService.handleLogin(response.token);

        const userId = localStorage.getItem('userId');
        if (userId) {
          this.cartService.initializeCart(userId);
        }

        alert('Inicio de sesión exitoso');
        this.router.navigate(['/Home']);
      },
      error: () => {
        alert('Credenciales inválidas.');
      }
    });
  }
}
