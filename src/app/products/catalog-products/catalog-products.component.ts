import { Component, OnInit, OnChanges, SimpleChanges  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { CapitalizePipe } from '../../capitalize/capitalize.pipe';

declare const bootstrap: any; // Importación de Bootstrap para modales

interface CustomJwtPayload {
  user_id: string;
}

@Component({
  selector: 'app-catalog-products',
  standalone: true,
  imports: [CommonModule,CapitalizePipe],
  templateUrl: './catalog-products.component.html',
  styleUrls: ['./catalog-products.component.css']
})
export class CatalogProductsComponent implements OnInit, OnChanges {
  productos: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  userId: string | null = null;
  productoSeleccionado: any = null;
  modalInstance: any;

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
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      this.userId = decodedToken.user_id;
    }
  }

  // 🔄 Detectar cambios en la lista de productos (por si se editan en admin-productos)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.cargarProductos(); // 🔄 Recarga los productos si hay cambios
    }
  }

  // Cargar productos desde el backend
  cargarProductos(): void {
    this.loading = true;
    this.productsService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)); // Ordenar alfabéticamente por nombre
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
      }
    });
  }


  // Obtener las claves de las especificaciones dinámicamente
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // 📦 Agregar producto al carrito
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

  getImageUrl(productId: string): string {
    const imageUrl = this.productsService.getProductImage(productId);

    return imageUrl;
  }


  abrirModal(producto: any): void {
    this.productoSeleccionado = producto;

    const modalElement = document.querySelector('.custom-bootstrap-modal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static', // Evita que se cierre al hacer clic fuera del modal
        keyboard: true // Permite cerrar con la tecla ESC
      });
      this.modalInstance.show();

      // Bootstrap maneja automáticamente el scroll del fondo
    }
  }

  cerrarModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.productoSeleccionado = null;

    // Bootstrap restaura automáticamente el scroll
  }


}
