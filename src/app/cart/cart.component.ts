import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { LocalStorageService } from '../services/local-storage.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carrito: any = null;
  error: string | null = null;
  loading: boolean = true;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    const userId = this.localStorageService.getItem('userId');
    if (userId) {
      this.cartService.getCartItems(userId).subscribe({
        next: (carrito) => {
          this.carrito = {
            ...carrito,
            subtotal: carrito.subtotal ?? 0.00,
            total: carrito.total ?? 0.00
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error al obtener el carrito:', error);
          this.error = '❌ No se pudo cargar el carrito. Intenta nuevamente.';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.error = '🚨 ¡Ups! Parece que no has iniciado sesión. 🛒<br>✨ Para agregar productos a tu carrito, inicia sesión ahora y disfruta de una mejor experiencia!✨';
    }
}


  actualizarCantidad(productoId: string, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      alert('Cantidad inválida.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.cartService.actualizarCantidadProducto(userId, productoId, nuevaCantidad).subscribe({
      next: () => {
        this.cartService.getCartItems(userId).subscribe({
          next: (carritoActualizado) => {
            this.carrito = carritoActualizado;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error al recargar el carrito:', error);
            this.error = 'No se pudo recargar el carrito.';
          }
        });
      },
      error: (error) => {
        console.error('Error al actualizar la cantidad:', error);
        this.error = 'No se pudo actualizar la cantidad.';
      }
    });
  }

  eliminarProducto(productoId: string): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.cartService.eliminarProducto(userId, productoId).subscribe({
      next: () => {
        // Filtrar el producto eliminado
        this.carrito.productos = this.carrito.productos.filter(
          (producto: any) => producto._id !== productoId
        );

        // Recalcular subtotal y total después de eliminar
        this.carrito.subtotal = this.carrito.productos.reduce(
          (acc: number, producto: any) => acc + producto.precio * producto.cantidad, 0
        );
        this.carrito.total = parseFloat((this.carrito.subtotal * 1.16).toFixed(2));

        // Forzar actualización de la vista
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al eliminar el producto:', error);
        this.error = '❌ No se pudo eliminar el producto.';
      }
    });
}
}
