import { Component, OnInit } from '@angular/core';
import { CartserviceService } from '../services/cartservice.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-cart',
  standalone: true,  // Si estás usando standalone components
  imports: [CommonModule],  // Asegúrate de agregar CommonModule aquí
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carrito: any[] = [];
  total: number = 0;

  constructor(private cartService: CartserviceService) {}

  ngOnInit(): void {
    const userId = 'Raúl Martínez';  // Cambia esto por el ID del usuario real
    this.cartService.obtenerCarrito(userId).subscribe((productos) => {
      this.carrito = productos;
      this.total = productos.reduce((acc, producto) => acc + (producto.precio_unitario * producto.cantidad), 0);
    });
  }
}
