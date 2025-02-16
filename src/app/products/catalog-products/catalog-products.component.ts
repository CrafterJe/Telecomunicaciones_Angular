import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  user_id: string;

}


@Component({
  selector: 'app-catalog-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-products.component.html',
  styleUrls: ['./catalog-products.component.css']
})
export class CatalogProductsComponent implements OnInit {
  productos: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  userId: string | null = null;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();

    // Extraer el user_id del token usando jwtDecode y el tipo personalizado
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);  // Decodificamos el token con el tipo personalizado
      this.userId = decodedToken.user_id;  // Ahora TypeScript sabe que 'user_id' existe
    }
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
      }
    });
  }

  // catalog-products.component.ts
  agregarAlCarrito(productoId: string, cantidad: number): void {
    if (!this.userId) {
      alert('Inicia sesión para agregar productos al carrito');
      return;
    }

    this.cartService.agregarAlCarrito(this.userId, productoId, cantidad).subscribe({
      next: (response: any) => {
        console.log('Producto agregado al carrito:', response);
        alert('Producto agregado exitosamente.');
      },
      error: (error: any) => {
        console.error('Error al agregar producto al carrito:', error);
        alert('No se pudo agregar el producto al carrito.');
      },
    });
  }
}
