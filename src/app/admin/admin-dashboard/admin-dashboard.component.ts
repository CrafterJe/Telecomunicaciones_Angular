import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { RouterLink } from '@angular/router'; // Importar RouterLink para que funcone boton 'Gestionar Usuarios'

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalUsuarios: number = 0;
  totalProductos: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.adminService.getTotalUsuarios().subscribe(data => {
      this.totalUsuarios = data.total;
    });

    this.adminService.getTotalProductos().subscribe(data => {
      this.totalProductos = data.total;
    });
  }
}
