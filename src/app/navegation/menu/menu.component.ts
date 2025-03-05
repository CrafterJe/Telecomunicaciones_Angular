import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  nombre: string = ''; // 🔥 Cambiar de 'username' a 'nombre' para reflejar correctamente el nombre real
  cartCount: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: object // 🔥 Agregado para verificar si estamos en el navegador
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 🔥 Obtener el nombre desde localStorage en la carga inicial
      this.nombre = this.authService.getNombre() || '';

      // 🔥 Suscribirse al nombre para recibir actualizaciones en tiempo real
      const nombreSub = this.authService.getNombre$().subscribe((nombre) => {
        this.nombre = nombre || ''; // 🔥 Actualiza el nombre si cambia en la cuenta
      });

      // Suscribirse al carrito y actualizar dinámicamente el contador
      const cartSub = this.cartService.getCarrito$().subscribe((carrito) => {
        this.actualizarCartCount(carrito);
      });

      // Agregar las suscripciones al manejador centralizado
      this.subscriptions.add(nombreSub);
      this.subscriptions.add(cartSub);

      // Inicializar el carrito si es necesario
      this.initCarrito();
    }

    if (this.authService.isAuthenticated()) {
      this.authService.updateRolUsuario();
    } else {
      console.warn("⚠️ Usuario no autenticado, no se verificará el rol.");
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.cartCount = 0;
    this.nombre = ''; // 🔥 Limpiar el nombre al cerrar sesión
  }

  private initCarrito(): void {
    if (!this.authService.isAuthenticated()) {
      console.warn('Usuario no autenticado. No se inicializa el carrito.');
      return;
    }

    const userId = isPlatformBrowser(this.platformId) ? localStorage.getItem('userId') : null;
    if (userId) {
      this.cartService.initializeCart(userId);
    } else {
      console.warn('No se encontró userId en localStorage.');
    }
  }

  private actualizarCartCount(carrito: any): void {
    if (carrito && carrito.productos) {
      this.cartCount = carrito.productos.reduce(
        (total: number, producto: any) => total + producto.cantidad,
        0
      );
    } else {
      this.cartCount = 0;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
