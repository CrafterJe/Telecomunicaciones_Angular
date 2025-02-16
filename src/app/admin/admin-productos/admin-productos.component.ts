import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AdminService],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.css']
})
export class AdminProductosComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  editingProduct: any | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getProducts().subscribe({
      next: (data) => {
        console.log("📦 Productos recibidos desde el backend:"/*, data*/);
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

  editProduct(product: any): void {
    this.editingProduct = { ...product };
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  saveEdit(): void {
    if (!this.editingProduct) return;

    this.adminService.updateProduct(this.editingProduct._id, this.editingProduct).subscribe(() => {
      this.loadProducts();
      this.editingProduct = null;
    });
  }

  deleteProduct(id: string): void {
    if (confirm("Are you sure you want to delete this product?")) {
      this.adminService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }
}
