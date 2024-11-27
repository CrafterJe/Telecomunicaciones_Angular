import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { CartserviceService } from '../../services/cartservice.service';

interface Especificaciones {
  ram: number;
  procesador: string;
}

interface Producto {
  _id: string;
  nombre: string;
  tipo: string;
  precio: number;
  especificaciones: Especificaciones;
  stock: number;
}

@Component({
  selector: 'app-catalog-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-products.component.html',
  styleUrls: ['./catalog-products.component.css']
})
export class CatalogProductsComponent implements OnInit {
  productos: Producto[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private productsService: ProductsService,
    private cartService: CartserviceService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.productsService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.stock > 0) {
      // Supongamos que el 'userId' es el ID del usuario autenticado
      const userId = 'user123';  // Obtén esto según el contexto de tu aplicación

      this.cartService.agregarProducto(userId, {
        _id: producto._id,
        nombre: producto.nombre,
        cantidad: 1,
        precio_unitario: producto.precio
      }).subscribe({
        next: () => {
          producto.stock--;  // Actualizamos el stock localmente
        },
        error: (err) => {
          console.error('Error al agregar producto al carrito', err);
        }
      });
    } else {
      console.warn(`El producto ${producto.nombre} no tiene stock disponible.`);
    }
  }
}
