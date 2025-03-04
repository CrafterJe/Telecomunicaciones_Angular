import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

declare var grecaptcha: any;
declare global {
  interface Window {
    onRecaptchaLoaded: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  username: string = '';
  password: string = '';
  error: string | null = null;
  recaptchaLoaded: boolean = false;
  recaptchaWidgetId: any = null;
  alreadyRendered: boolean = false; // Evitar múltiples renderizaciones

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadRecaptchaScript();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.alreadyRendered && typeof grecaptcha !== 'undefined' && grecaptcha.render) {
        this.renderReCaptcha();
      }
      this.ngZone.run(() => {
        console.log('Marking application as stable');
      });
    }, 1000);
  }


  loadRecaptchaScript(): void {
    if (typeof document === 'undefined') {
      console.warn('`document` is not available, skipping reCAPTCHA script loading');
      return;
    }

    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      console.log('reCAPTCHA script already loaded');
      this.waitForRecaptcha();
      return;
    }

    console.log('Loading reCAPTCHA script');
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
    script.async = true;
    script.defer = true;

    window.onRecaptchaLoaded = () => {
      this.ngZone.run(() => {
        console.log('reCAPTCHA loaded via callback');
        this.recaptchaLoaded = true;
        this.renderReCaptcha();
      });
    };

    script.onload = () => {
      console.log('reCAPTCHA script loaded');
      this.waitForRecaptcha();
    };

    document.head.appendChild(script);
  }


  waitForRecaptcha(): void {
    const checkRecaptcha = () => {
      if (!this.alreadyRendered && typeof grecaptcha !== 'undefined' && grecaptcha.render) {
        this.ngZone.run(() => {
          console.log('reCAPTCHA is now available');
          this.recaptchaLoaded = true;
          this.renderReCaptcha();
        });
      } else {
        console.log('Waiting for reCAPTCHA...');
        setTimeout(checkRecaptcha, 100);
      }
    };

    checkRecaptcha();
  }

  renderReCaptcha(): void {
    if (this.alreadyRendered) {
      console.log('reCAPTCHA already rendered, skipping...');
      return;
    }

    console.log('Attempting to render reCAPTCHA');
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.error('reCAPTCHA container not found');
      return;
    }

    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      try {
        console.log('Rendering reCAPTCHA...');
        container.innerHTML = '';

        if (this.recaptchaWidgetId !== null) {
          grecaptcha.reset(this.recaptchaWidgetId);
          console.log('reCAPTCHA widget reset');
        } else {
          this.recaptchaWidgetId = grecaptcha.render('recaptcha-container', {
            'sitekey': '6LcU3egqAAAAABFTdP3e4lFGmr_NpyhXhgSjvEDy',
            'callback': (response: any) => {
              this.ngZone.run(() => {
                console.log('reCAPTCHA response received');
              });
            },
            'expired-callback': () => {
              this.ngZone.run(() => {
                console.log('reCAPTCHA expired');
              });
            },
            'error-callback': () => {
              this.ngZone.run(() => {
                console.error('reCAPTCHA error');
              });
            }
          });
          console.log('reCAPTCHA widget rendered with ID:', this.recaptchaWidgetId);
        }

        this.alreadyRendered = true; // Marcar que ya se renderizó
      } catch (e) {
        console.error('Error rendering reCAPTCHA:', e);
      }
    } else {
      console.error('grecaptcha is not available yet');
    }
  }

  login(): void {
    if (!this.username || !this.password) {
      alert('Por favor, complete ambos campos.');
      return;
    }

    if (!this.recaptchaLoaded) {
      alert('El reCAPTCHA aún no se ha cargado. Por favor espere un momento.');
      return;
    }

    try {
      const captchaResponse = grecaptcha.getResponse(this.recaptchaWidgetId);
      if (!captchaResponse) {
        alert('Por favor, completa el reCAPTCHA.');
        return;
      }

      const credentials = {
        usuario: this.username,
        password: this.password,
        captcha: captchaResponse
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
          console.log('Credenciales inválidas.');
          if (this.recaptchaWidgetId !== null) {
            grecaptcha.reset(this.recaptchaWidgetId);
          }
        }
      });
    } catch (error) {
      console.error('Error with reCAPTCHA:', error);
      alert('Hubo un problema con el reCAPTCHA. Por favor recargue la página.');
    }
  }
}
