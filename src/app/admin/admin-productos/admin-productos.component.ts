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
  isEditingProduct: boolean = false; //Controla si se esta editando un nuevo producto
  isAddingProduct: boolean = false; // Controla si se está agregando un nuevo producto
  newProduct: Producto = this.createEmptyProduct();
  newSpecKey: string = '';
  newSpecValue: string = '';
  availableSpecs: string[] = []; // Lista de especificaciones reutilizables
  selectedSpec: string = '';
  isAddingNewSpec: boolean = false;
  showDeleteModal: boolean = false;  // Estado del modal de eliminación
  showSaveModal: boolean = false;    // Estado del modal de guardar cambios
  productToDeleteId: string | null = null;
  availableTypes: string[] = [];
  selectedType: string = '';
  isAddingNewType: boolean = false; // Controla si se usa un dropdown o un input
  isAddingNewTypeEdit: boolean = false;
  selectedTypeEdit: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getProducts().subscribe({
      next: (data) => {
        console.log("📦 Productos recibidos desde el backend:", data);
        this.products = data.sort((a: Producto, b: Producto) => a.nombre.localeCompare(b.nombre));
        this.filteredProducts = [...this.products];
        this.extractAvailableTypes();
        this.extractAvailableSpecifications();
      },
      error: (err) => {
        console.error("❌ Error al obtener productos:", err);
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }


  extractAvailableTypes(): void {
    const typeSet = new Set<string>();
    this.products.forEach(product => {
      if (product.tipo && product.tipo.trim() !== "") {
        typeSet.add(product.tipo.trim());
      }
    });
    this.availableTypes = Array.from(typeSet);
    console.log("📌 Tipos de productos disponibles:", this.availableTypes); // 🔹 Verifica en consola
  }


  toggleTypeMode(): void {
    this.isAddingNewType = !this.isAddingNewType;
    if (this.isAddingNewType) {
      this.newProduct.tipo = ''; // Limpiar si cambia al modo manual
    } else {
      this.newProduct.tipo = this.selectedType;
    }
  }

  toggleTypeModeEdit(): void {
    this.isAddingNewTypeEdit = !this.isAddingNewTypeEdit;
    if (this.isAddingNewTypeEdit) {
      this.editingProduct!.tipo = ''; // Limpiar si cambia al modo manual
    } else {
      this.editingProduct!.tipo = this.selectedTypeEdit;
    }
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

  createEmptyProduct(): Producto {
    return {
      _id: '',
      nombre: '',
      tipo: '',
      precio: 0,
      stock: 0,
      especificaciones: {}
    };
  }

  openAddProductForm(): void {
    this.isAddingProduct = true;
    this.isEditingProduct = false;  // Asegurar que si se abre este, el otro se cierre
    this.editingProduct = null;  // Limpiar cualquier edición en curso
    this.newProduct = this.createEmptyProduct();
  }

  cancelAddProduct(): void {
    this.isAddingProduct = false;
  }

  addProduct(): void {
    if (!this.newProduct.nombre.trim() || !this.newProduct.tipo.trim()) {
      alert('Por favor ingresa un nombre y tipo para el producto.');
      return;
    }

    this.adminService.addProduct(this.newProduct).subscribe(() => {
      this.loadProducts();
      this.isAddingProduct = false;
    });
  }

  toggleSpecMode(): void {
    this.isAddingNewSpec = !this.isAddingNewSpec;
    this.newSpecKey = ''; // Limpiar input si cambia de modo
    this.selectedSpec = ''; // Limpiar dropdown si cambia de modo
  }

  addSpecificationToProduct(): void {
    let specKey = this.isAddingNewSpec ? this.newSpecKey.trim() : this.selectedSpec;

    if (!specKey || !this.newSpecValue.trim()) {
      alert('Por favor ingresa un nombre y valor para la especificación.');
      return;
    }

    if (!this.newProduct.especificaciones) {
      this.newProduct.especificaciones = {};
    }

    if (this.newProduct.especificaciones.hasOwnProperty(specKey)) {
      alert(`La especificación "${specKey}" ya está agregada a este producto.`);
      return;
    }

    this.newProduct.especificaciones[specKey] = this.newSpecValue.trim();

    if (!this.availableSpecs.includes(specKey)) {
      this.availableSpecs.push(specKey);
    }

    this.newSpecKey = '';
    this.selectedSpec = '';
    this.newSpecValue = '';
    this.isAddingNewSpec = false;
  }

  removeSpecificationFromProduct(key: string): void {
    if (this.newProduct?.especificaciones) {
      delete this.newProduct.especificaciones[key];
    }
  }


  openDeleteModal(productId: string): void {
    this.productToDeleteId = productId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.productToDeleteId) {
      this.adminService.deleteProduct(this.productToDeleteId).subscribe(() => {
        this.loadProducts();
        this.showDeleteModal = false;
        this.productToDeleteId = null;
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDeleteId = null;
  }

  openSaveModal(): void {
    this.showSaveModal = true;
  }

  confirmSave(): void {
    if (!this.editingProduct) return;

    this.adminService.updateProduct(this.editingProduct._id, this.editingProduct).subscribe(() => {
      this.loadProducts();
      this.editingProduct = null;
      this.showSaveModal = false;

    });
  }

  cancelSave(): void {
    this.showSaveModal = false;
  }

  filterProducts(): void {
    this.filteredProducts = this.products
      .filter(product => product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()))
      .sort((a: Producto, b: Producto) => a.nombre.localeCompare(b.nombre)); // Especificar tipo Producto
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  editProduct(producto: Producto): void {
    this.editingProduct = {
      ...producto,
      especificaciones: producto.especificaciones || {} // Asegura que nunca sea undefined
    };
    this.isEditingProduct = true;
    this.isAddingProduct = false;
  }

  cancelEdit(): void {
    this.isEditingProduct = false;
    this.editingProduct = null;
  }

  saveEdit(): void {
    if (!this.editingProduct) return;

    this.adminService.updateProduct(this.editingProduct._id, this.editingProduct).subscribe(() => {
      this.loadProducts();
      this.isEditingProduct = false; // 🔹 Cierra el formulario de edición
      this.editingProduct = null;
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
