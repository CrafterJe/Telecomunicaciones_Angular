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

  // En login.component.ts
  login(): void {
    const credentials = {
      usuario: this.username,
      password: this.password
    };

    console.log('Intentando login con:', credentials);

    this.authService.login(credentials).subscribe({
      next: (data) => {
        console.log('Login exitoso:', data);
        alert('Login exitoso');
        localStorage.setItem('token', data.token);
        this.router.navigate(['/Home']);
      },
      error: (err) => {
        console.log('Error detallado:', err);
        console.log('Status:', err.status);
        console.log('Mensaje:', err.error);
        alert('Error: ' + (err.error?.message || 'Usuario o contraseña incorrectos'));
      }
    });
}
}
