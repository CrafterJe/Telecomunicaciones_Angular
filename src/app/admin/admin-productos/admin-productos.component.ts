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
  availableSpecs: string[] = []; // Lista de especificaciones reutilizables
  selectedSpec: string = '';
  isAddingNewSpec: boolean = false;

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

        // Extraer nombres únicos de especificaciones
        this.extractAvailableSpecifications();
      },
      error: (err) => {
        console.error("❌ Error al obtener productos:", err);
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  extractAvailableSpecifications(): void {
    const specsSet = new Set<string>();
    this.products.forEach(product => {
      if (product.especificaciones) {
        Object.keys(product.especificaciones).forEach(spec => specsSet.add(spec));
      }
    });
    this.availableSpecs = Array.from(specsSet);
  }

  toggleSpecMode(): void {
    this.isAddingNewSpec = !this.isAddingNewSpec;
    this.newSpecKey = ''; // Limpiar input si cambia de modo
    this.selectedSpec = ''; // Limpiar dropdown si cambia de modo
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
    if (!this.editingProduct) return;

    let specKey = this.isAddingNewSpec ? this.newSpecKey.trim() : this.selectedSpec; // Usa el dropdown o el input manual

    if (!specKey || !this.newSpecValue.trim()) {
      alert('Por favor ingresa un nombre y valor para la especificación.');
      return;
    }

    if (!this.editingProduct.especificaciones) {
      this.editingProduct.especificaciones = {};
    }

    if (this.editingProduct.especificaciones.hasOwnProperty(specKey)) {
      alert(`La especificación "${specKey}" ya está agregada a este producto.`);
      return;
    }

    this.editingProduct.especificaciones[specKey] = this.newSpecValue.trim();

    if (!this.availableSpecs.includes(specKey)) {
      this.availableSpecs.push(specKey);
    }

    this.newSpecKey = '';
    this.selectedSpec = '';
    this.newSpecValue = '';
    this.isAddingNewSpec = false; // Resetear modo después de agregar
  }


  removeSpecification(key: string): void {
    if (this.editingProduct?.especificaciones) { // Validación para evitar errores
      delete this.editingProduct.especificaciones[key];
    }
  }
}
