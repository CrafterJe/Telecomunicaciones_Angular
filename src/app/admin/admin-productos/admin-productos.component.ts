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
  nuevasImagenes: File[] = [];
  videoLink: string = '';
  previewImageUrls: string[] = [];
  removedImagesIndexes: number[] = []; // Índices de imágenes eliminadas
  replacedImages: { index: number; file: File }[] = []; // Reemplazos de imagenes


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
      especificaciones: {},
      imagenes: [], // Arreglo vacío de imágenes
      video_link: '' // Inicializar el enlace de video vacío
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
    if (
      !this.newProduct.nombre.trim() ||
      !this.newProduct.tipo.trim() ||
      isNaN(this.newProduct.precio) || this.newProduct.precio <= 0 ||
      isNaN(this.newProduct.stock) || this.newProduct.stock < 0
    ) {
      alert('❌ El nombre, tipo, precio (mayor a 0) y stock (0 o mayor) son obligatorios.');
      return;
    }

    const productData = {
      nombre: this.newProduct.nombre,
      tipo: this.newProduct.tipo,
      precio: this.newProduct.precio,  // Número directo
      stock: this.newProduct.stock,    // Número directo
      especificaciones: this.newProduct.especificaciones || {},
      imagenes: this.nuevasImagenes.slice(0, 5), // Enviar imágenes si hay
      videoLink: this.videoLink || ''
    };

    // 🚀 Enviar la solicitud como JSON
    this.adminService.addProduct(productData).subscribe({
      next: () => {
        this.loadProducts();
        this.isAddingProduct = false;
        this.newProduct = this.createEmptyProduct();
        alert('✅ Producto agregado correctamente.');
      },
      error: (err) => {
        console.error('❌ Error al agregar producto:', err);
        alert('Error al agregar el producto.');
      }
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

    if (!this.editingProduct.nombre.trim() || !this.editingProduct.tipo.trim()) {
      alert('❌ El nombre y tipo del producto son obligatorios.');
      return;
    }

    // ✅ Convertir precio y stock a números y validar
    let precio, stock;

    try {
      precio = typeof this.editingProduct.precio === 'number'
        ? this.editingProduct.precio
        : parseFloat(String(this.editingProduct.precio).replace(',', '.'));

      stock = typeof this.editingProduct.stock === 'number'
        ? this.editingProduct.stock
        : parseInt(String(this.editingProduct.stock), 10);

      if (isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0) {
        console.error('❌ Validación fallida. Precio:', precio, 'Stock:', stock);
        alert('❌ El precio debe ser un número mayor a 0 y el stock un número entero mayor o igual a 0.');
        return;
      }
    } catch (error) {
      console.error('❌ Error en la conversión de números:', error);
      alert('❌ El precio debe ser un número mayor a 0 y el stock un número entero mayor o igual a 0.');
      return;
    }

    this.editingProduct.precio = precio;
    this.editingProduct.stock = stock;

    console.log('📌 Precio antes de enviar:', precio, typeof precio);
    console.log('📌 Stock antes de enviar:', stock, typeof stock);

    const formData = new FormData();

    formData.append('nombre', this.editingProduct.nombre);
    formData.append('tipo', this.editingProduct.tipo);
    formData.append('precio', precio.toString());
    formData.append('stock', stock.toString());

    // ✅ Asegurar que se envíen especificaciones correctamente
    if (this.editingProduct.especificaciones && Object.keys(this.editingProduct.especificaciones).length > 0) {
      formData.append('especificaciones', JSON.stringify(this.editingProduct.especificaciones));
    }

    // ✅ Enviar `videoLink`, si se deja vacío, enviarlo como string vacío para eliminarlo en la BD
    if (this.editingProduct.videoLink) {
      formData.append('videoLink', this.editingProduct.videoLink);
    } else {
      formData.append('videoLink', ''); // Para eliminar el enlace si el usuario lo borra
    }

    // ✅ Solo agregar removedImagesIndexes si tiene valores
    if (this.removedImagesIndexes.length > 0) {
      formData.append('removedImagesIndexes', JSON.stringify(this.removedImagesIndexes));
    }

    // ✅ Manejar imágenes reemplazadas
    this.replacedImages.forEach((replacedImg) => {
      formData.append(`replacedImage_${replacedImg.index}`, replacedImg.file);
    });

    // 🚀 Enviar la actualización al backend
    this.adminService.updateProduct(this.editingProduct._id, formData).subscribe({
      next: () => {
        this.loadProducts();
        this.editingProduct = null;
        this.showSaveModal = false;
        this.removedImagesIndexes = [];
        this.replacedImages = [];
        this.nuevasImagenes = [];
        alert('✅ Producto actualizado correctamente.');
      },
      error: (error) => {
        console.error('❌ Error al actualizar producto:', error);
        alert('Error al actualizar el producto. Revisa los datos.');
      }
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
      especificaciones: producto.especificaciones || {}
    };

    this.isEditingProduct = true;
    this.isAddingProduct = false;

    // Previsualizar imágenes existentes
    if (producto.imagenes && producto.imagenes.length > 0) {
      this.previewImageUrls = producto.imagenes.map((img) => `data:image/jpeg;base64,${img}`);
    } else {
      this.previewImageUrls = [];
    }

    // Enlace de video existente en la edición
    this.editingProduct['videoLink'] = producto.videoLink || '';

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

  onImagesSelected(event: any): void {
    const files = event.target.files;

    if (files.length + this.nuevasImagenes.length > 5) {
      alert('❌ Solo se permiten hasta 5 imágenes en total.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'jpg' && file.type !== 'image/jpeg') {
        alert('❌ Solo se permiten imágenes en formato JPG.');
        return;
      }

      this.nuevasImagenes.push(file);

      // 🖼️ Generar la previsualización
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  removeImage(imgUrl: string): void {
    const index = this.previewImageUrls.indexOf(imgUrl);
    if (index > -1) {
      this.previewImageUrls.splice(index, 1);
      this.nuevasImagenes.splice(index, 1); // Elimina también del arreglo de imágenes
    }
  }

  removeExistingImage(index: number): void {
    if (this.previewImageUrls[index]) {
      this.removedImagesIndexes.push(index); // 🗑️ Marcar imagen para eliminar
      this.previewImageUrls.splice(index, 1);
    }
  }

  replaceImage(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'jpg' && file.type !== 'image/jpeg') {
        alert('❌ Solo se permiten imágenes en formato JPG.');
        event.target.value = '';
        return;
      }

      // 🔄 Reemplazar imagen en la previsualización
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrls[index] = e.target.result;
      };
      reader.readAsDataURL(file);

      // 🔄 Registrar la nueva imagen para enviar al backend
      const existingReplacement = this.replacedImages.find((img) => img.index === index);
      if (existingReplacement) {
        existingReplacement.file = file;
      } else {
        this.replacedImages.push({ index, file });
      }
    }
  }
}
