import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../interfaces/product.interface';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AdminService],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.css']
})
export class AdminProductosComponent implements OnInit {
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  searchQuery: string = '';
  editingProduct: Producto | null = null;
  newSpecKey: string = '';
  newSpecValue: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getProducts().subscribe({
      next: (data) => {
        console.log("📦 Productos recibidos desde el backend:", data);
        this.products = data;
        this.filteredProducts = [...this.products];
      },
      error: (err) => {
        console.error("❌ Error al obtener productos:", err);
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product =>
      product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  editProduct(producto: Producto): void {
    this.editingProduct = {
      ...producto,
      especificaciones: producto.especificaciones || {} // Asegura que nunca sea undefined
    };
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  saveEdit(): void {
    if (!this.editingProduct) return;

    this.adminService.updateProduct(this.editingProduct._id, this.editingProduct).subscribe(() => {
      this.loadProducts();
      this.editingProduct = null;

      // Recargar productos en catalog-products después de la edición
      this.adminService.getProducts().subscribe(products => {
        this.products = products;
      });
    });
  }


  deleteProduct(id: string): void {
    if (confirm("Estas seguro de eliminar este producto?")) {
      this.adminService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  addSpecification(): void {
    if (!this.newSpecKey.trim() || !this.newSpecValue.trim()) {
      alert('Ingresa un nombre y la especificacion.');
      return;
    }

    if (this.editingProduct) { // Validación para evitar errores de null
      if (!this.editingProduct.especificaciones) {
        this.editingProduct.especificaciones = {};
      }

      // Agregar la nueva especificación
      this.editingProduct.especificaciones[this.newSpecKey] = this.newSpecValue;

      // Limpiar los inputs
      this.newSpecKey = '';
      this.newSpecValue = '';
    }
  }

  removeSpecification(key: string): void {
    if (this.editingProduct?.especificaciones) { // Validación para evitar errores
      delete this.editingProduct.especificaciones[key];
    }
  }
}
