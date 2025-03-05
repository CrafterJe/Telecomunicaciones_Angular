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
  alreadyRendered: boolean = false;
  private scriptLoaded: boolean = false;

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
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoaded`;
    script.async = true;
    script.defer = true;

    // Add a timeout to prevent indefinite waiting
    const scriptLoadTimeout = setTimeout(() => {
      console.error('❌ Tiempo de espera agotado al cargar reCAPTCHA');
      this.scriptLoaded = false;
    }, 10000); // 10 seconds timeout

    window.onRecaptchaLoaded = () => {
      clearTimeout(scriptLoadTimeout);
      console.log('✅ reCAPTCHA cargado globalmente.');
      this.waitForRecaptcha();
    };

    script.onload = () => {
      clearTimeout(scriptLoadTimeout);
      console.log('✅ Script de reCAPTCHA cargado.');
      this.scriptLoaded = true;
    };

    script.onerror = () => {
      clearTimeout(scriptLoadTimeout);
      console.error('❌ Error al cargar el script de reCAPTCHA');
      this.scriptLoaded = false;
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
        // Clear any existing reCAPTCHA widgets
        if (this.recaptchaWidgetId !== null) {
          try {
            grecaptcha.reset(this.recaptchaWidgetId);
          } catch (resetError) {
            console.warn('⚠️ No se pudo restablecer el widget de reCAPTCHA existente:', resetError);
          }
        }

        // Ensure the container is clean
        container.innerHTML = '';
        container.removeAttribute('data-rendered');

        this.recaptchaWidgetId = grecaptcha.render(container, {
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
        this.alreadyRendered = true;
        this.cdRef.detectChanges();
      } catch (e: unknown) {
        // Properly handle the unknown error type
        if (e instanceof Error) {
          console.error('❌ Error al renderizar reCAPTCHA:', e.message);

          // Add a fallback mechanism to reset if rendering fails
          if (e.message.includes('already been rendered')) {
            console.warn('🔄 Intentando recuperarse del error de renderización...');
            try {
              grecaptcha.reset();
            } catch (resetError) {
              console.error('❌ No se pudo recuperar del error de renderización:',
                resetError instanceof Error ? resetError.message : resetError);
            }
          }
        } else {
          // Handle cases where the error is not an Error instance
          console.error('❌ Error desconocido al renderizar reCAPTCHA:', e);
        }
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
