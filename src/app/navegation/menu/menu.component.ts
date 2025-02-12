import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  username: string = '';
  cartCount: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Suscribirse al username para mostrarlo en el menú
    const usernameSub = this.authService.getUsername$().subscribe((username) => {
      this.username = username || '';
    });

    // Suscribirse al carrito y actualizar dinámicamente el contador
    const cartSub = this.cartService.getCarrito$().subscribe((carrito) => {
      this.actualizarCartCount(carrito);
    });

    // Agregar las suscripciones al manejador centralizado
    this.subscriptions.add(usernameSub);
    this.subscriptions.add(cartSub);

    // Inicializar el carrito si es necesario
    this.initCarrito();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin(); // Verifica si el usuario es admin
  }

  logout(): void {
    this.authService.logout();
    this.cartCount = 0;
  }

  private initCarrito(): void {
    if (!this.authService.isAuthenticated()) {
      console.warn('Usuario no autenticado. No se inicializa el carrito.');
      return;
    }

    const userId = this.authService.getFromLocalStorage('userId');
    if (userId) {
      this.cartService.initializeCart(userId); // Sincroniza el carrito con el servidor
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
