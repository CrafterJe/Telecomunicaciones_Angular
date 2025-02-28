import { Component, OnInit, OnChanges, SimpleChanges  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { CapitalizePipe } from '../../capitalize/capitalize.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  imagenSeleccionada: number = 0;
  modalInstance: any;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
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

  // Detectar cambios en la lista de productos (por si se editan en admin-productos)
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
        this.productos = data
        .map((producto: any) => ({
          ...producto,
          imagenActual: 0  // Inicializa la imagen actual en la primera
        }))
        .sort((a: any, b: any) => a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())); // Ordenar alfabéticamente por nombre

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

  // Agregar producto al carrito
  agregarAlCarrito(productoId: string, cantidad: number): void {
    if (!this.userId) {
        alert('🚨 Inicia sesión para agregar productos al carrito');
        return;
    }

    const userId = this.userId!;

    // Buscar el producto en la lista de productos cargados
    const producto = this.productos.find(p => p._id === productoId);
    if (!producto) return;

    // ❌ Evitar solicitud al backend si el stock es insuficiente
    if (cantidad > producto.stock) {
      alert(`⚠️ Stock insuficiente. Solo quedan ${producto.stock} unidades disponibles.`);
        return;
    }

    // ✅ Solo si el stock es suficiente, hacer la petición al backend
    this.cartService.agregarAlCarrito(userId, productoId, cantidad).subscribe({
        next: (response: any) => {
            if (response && response.message === "error_controlado") {
                console.log(`⚠️ ${response.error}`); // Mostrar mensaje del backend sin errores en consola
            } else {
                alert('✅ Producto agregado exitosamente.');
            }
        },
        error: () => {
            // 🔹 No mostrar error en consola, ya que está controlado en `cart.service.ts`
        },
    });
}


  getImageUrl(productId: string, index: number): string {
    return this.productsService.getProductImage(productId, index);
  }

  // Cambiar imagen en el carrusel
  cambiarImagen(producto: any, cambio: number): void {
    if (!producto.imagenes || producto.imagenes.length === 0) {
      return; // Evita errores si no hay imágenes
    }
    producto.imagenActual = (producto.imagenActual + cambio + producto.imagenes.length) % producto.imagenes.length;
  }

  // Seleccionar una imagen en el modal
  seleccionarImagen(index: number): void {
    this.imagenSeleccionada = index;
  }

  // Convertir URL segura para el iframe de YouTube
  getSafeVideoUrl(videoUrl: string | undefined): SafeResourceUrl | null {
    if (!videoUrl) return null;

    const videoId = this.extraerVideoIdDeYoutube(videoUrl);
    return videoId ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`) : null;
  }

  extraerVideoIdDeYoutube(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([^"&?\/\s]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  seleccionarVideo(): void {
    this.imagenSeleccionada = -1; // Usamos -1 para indicar que el video está seleccionado
  }

  abrirModal(producto: any, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    // Si ya hay una instancia previa del modal, elimínala antes de crear una nueva
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.modalInstance = null;
    }

    this.productoSeleccionado = { ...producto };
    this.imagenSeleccionada = 0;

    setTimeout(() => {
      const modalElement = document.getElementById('productoModal');
      if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement, {
          backdrop: 'static', // Evita que Bootstrap lo cierre al hacer clic fuera
          keyboard: true
        });

        this.modalInstance.show();

        // 🛠️ Elimina backdrop después de que Bootstrap lo haya creado
        setTimeout(() => {
          document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            if (document.body.contains(backdrop)) {
              backdrop.remove();
            }
          });
        }, 500); // Asegura que Bootstrap haya terminado la animación
      }
    }, 100);
  }

  cerrarModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();

      setTimeout(() => {
        if (this.modalInstance) {
          this.modalInstance.dispose();
          this.modalInstance = null;
        }

        // 🛠️ Asegurar eliminación segura del backdrop
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
          if (document.body.contains(backdrop)) {
            backdrop.remove();
          }
        });

        this.productoSeleccionado = null; // Limpia la selección
      }, 500); // Espera a que Bootstrap termine de cerrar el modal
    }
  }


  // Asegúrate de limpiar los recursos cuando el componente se destruye
  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }

}
