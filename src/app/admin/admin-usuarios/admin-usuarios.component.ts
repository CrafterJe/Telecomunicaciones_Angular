import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioActual: string = '';

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUserId();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.adminService.getUsuarios().subscribe(data => {
      this.usuarios = data;
    });
  }

  cambiarRol(usuario: any): void {
    if (usuario._id === this.usuarioActual) {
      alert('No puedes cambiar tu propio rol mientras estás logueado.');
      return;
    }

    this.adminService.actualizarRol(usuario._id, usuario.rol).subscribe(() => {
      alert(`Rol de ${usuario.nombre} actualizado a ${usuario.rol}`);
    });
  }

  eliminarUsuario(id: string): void {
    if (id === this.usuarioActual) {
      alert('No puedes eliminar tu propio usuario mientras está logueado.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      console.log(`🔄 Intentando eliminar usuario`);

      this.adminService.deleteUsuario(id).subscribe({
        next: () => {
          alert(`✅ Usuario eliminado correctamente`);
          this.usuarios = this.usuarios.filter(u => u._id !== id);
        },
        error: (error) => {
          console.error("❌ Error al eliminar usuario:", error);
          alert("Hubo un problema al eliminar el usuario.");
        }
      });
    }
  }


}
