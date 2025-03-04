import { Component, OnInit, NgZone, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  siteKey: string = '6LcU3egqAAAAABFTdP3e4lFGmr_NpyhXhgSjvEDy';
  alreadyRendered: boolean = false; // Añadido de vuelta
  private scriptLoaded: boolean = false; // Nueva bandera para controlar carga de script

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRecaptchaScript();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.waitForRecaptcha();
    }
  }

  /**
   * Cargar el script de reCAPTCHA solo si no está en la página
   */
  loadRecaptchaScript(): void {
    if (!isPlatformBrowser(this.platformId) || this.scriptLoaded) return;

    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      console.log('✅ El script de reCAPTCHA ya está cargado.');
      this.scriptLoaded = true;
      return;
    }

    console.log('⏳ Cargando script de reCAPTCHA...');
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Script de reCAPTCHA cargado.');
      this.scriptLoaded = true;
      this.waitForRecaptcha();
    };

    document.head.appendChild(script);
  }

  /**
   * Esperar a que `grecaptcha` esté disponible y luego renderizar
   */
  waitForRecaptcha(): void {
    if (!isPlatformBrowser(this.platformId) || this.alreadyRendered) return;

    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      console.log('✅ reCAPTCHA está listo para renderizar.');
      this.renderReCaptcha();
    } else {
      console.log('🔄 Esperando que grecaptcha esté disponible...');
      setTimeout(() => this.waitForRecaptcha(), 500);
    }
  }

  /**
   * Renderiza el reCAPTCHA en el contenedor y marca que está listo
   */
  renderReCaptcha(): void {
    if (!isPlatformBrowser(this.platformId) || this.alreadyRendered) return;

    console.log('🔄 Intentando renderizar reCAPTCHA...');
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.error('❌ No se encontró el contenedor de reCAPTCHA.');
      return;
    }

    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      try {
        container.innerHTML = ''; // Limpiar antes de renderizar
        this.recaptchaWidgetId = grecaptcha.render('recaptcha-container', {
          sitekey: this.siteKey,
          callback: (response: any) => {
            this.ngZone.run(() => {
              console.log('✅ reCAPTCHA validado.');
              this.recaptchaLoaded = true;
              this.cdRef.detectChanges();
            });
          },
          'expired-callback': () => {
            this.ngZone.run(() => {
              console.log('⚠️ reCAPTCHA expirado.');
              this.recaptchaLoaded = false;
              this.cdRef.detectChanges();
            });
          },
          'error-callback': () => {
            this.ngZone.run(() => {
              console.error('❌ Error en reCAPTCHA.');
              this.recaptchaLoaded = false;
              this.cdRef.detectChanges();
            });
          }
        });

        console.log('✅ reCAPTCHA renderizado correctamente.');
        this.recaptchaLoaded = true;
        this.alreadyRendered = true; // Evitar futuras renderizaciones
        this.cdRef.detectChanges();
      } catch (e) {
        console.error('❌ Error al renderizar reCAPTCHA:', e);
      }
    } else {
      console.error('⚠️ grecaptcha aún no está disponible.');
      setTimeout(() => this.renderReCaptcha(), 500);
    }
  }

  login(): void {
    if (!this.username || !this.password) {
      alert('❌ Por favor, complete ambos campos.');
      return;
    }

    if (!this.recaptchaLoaded) {
      alert('⚠️ El reCAPTCHA aún no se ha cargado. Por favor espere un momento.');
      return;
    }

    try {
      const captchaResponse = grecaptcha.getResponse(this.recaptchaWidgetId);
      if (!captchaResponse) {
        alert('⚠️ Por favor, completa el reCAPTCHA.');
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

          alert('✅ Inicio de sesión exitoso');
          this.router.navigate(['/Home']);
        },
        error: () => {
          console.log('❌ Credenciales inválidas.');
          if (this.recaptchaWidgetId !== null) {
            grecaptcha.reset(this.recaptchaWidgetId);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error con reCAPTCHA:', error);
      alert('⚠️ Hubo un problema con el reCAPTCHA. Por favor recargue la página.');
    }
  }
}
