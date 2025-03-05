import { Component } from '@angular/core';
import { PanelAccountService } from '../../services/panel-account.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  user: any = {
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    email: '',
    usuario: ''
  };

  originalUser: any = {}; // Para comparar cambios
  passwordData: any = { current_password: '', new_password: '' };

  editNombre = false;
  editUsuario = false;
  editEmail = false;

  constructor(private panelAccountService: PanelAccountService,
    private authService: AuthService,
  ) {
    if (typeof window !== 'undefined') {
      this.loadUserProfile(); // Solo ejecuta si está en el navegador
    } else {
      console.warn("⚠️ No se puede cargar el perfil en SSR.");
    }
  }



  // Método para cargar el perfil del usuario
  loadUserProfile() {
    this.panelAccountService.getProfile().subscribe({
      next: (data) => {
        this.user = { ...data };
        this.originalUser = { ...data };
      },
      error: (err) => {
        console.error("❌ Error al obtener perfil:", err);

        // Evita usar alert() en SSR
        if (typeof window !== 'undefined') {
          alert(err.error?.error || "Error al obtener perfil");
        } else {
          console.warn("⚠️ Error al obtener perfil:", err.error?.error || "Error desconocido.");
        }
      }
    });
  }


  // Alternar edición de los campos
  toggleEdit(field: string) {
    if (field === 'nombre') this.editNombre = !this.editNombre;
    if (field === 'usuario') this.editUsuario = !this.editUsuario;
    if (field === 'email') this.editEmail = !this.editEmail;
  }

  // Verificar si hay cambios en un campo
  hasChanges(field: string): boolean {
    if (field === 'nombre') {
      return (
        this.user.nombre !== this.originalUser.nombre ||
        this.user.apellidoP !== this.originalUser.apellidoP ||
        this.user.apellidoM !== this.originalUser.apellidoM
      );
    }
    if (field === 'usuario') return this.user.usuario !== this.originalUser.usuario;
    if (field === 'email') return this.user.email !== this.originalUser.email;
    return false;
  }

  // Actualizar Nombre y Apellidos
  updateNombre() {
    this.panelAccountService.updateNombre(this.user).subscribe({
      next: () => {
        alert("Nombre actualizado correctamente");
        this.originalUser = { ...this.user }; // Guardamos cambios
        this.editNombre = false;

        // 🔥 Actualizar SOLO el nombre en el Navbar (sin apellidos)
        this.authService.updateNombre(this.user.nombre);
      },
      error: (err) => {
        console.error("Error al actualizar nombre:", err);
        alert(err.error?.error || "Error al actualizar nombre");
      }
    });
  }

  // Actualizar Usuario
  updateUsuario() {
    this.panelAccountService.updateUsuario(this.user).subscribe({
      next: () => {
        alert("Usuario actualizado correctamente");
        this.originalUser = { ...this.user };
        this.editUsuario = false;
      },
      error: (err) => {
        console.error("Error al actualizar usuario:", err);
        alert(err.error?.error || "Error al actualizar usuario");
      }
    });
  }

  // Actualizar Email
  updateEmail() {
    this.panelAccountService.updateEmail(this.user).subscribe({
      next: () => {
        alert("Email actualizado correctamente");
        this.originalUser = { ...this.user };
        this.editEmail = false;
      },
      error: (err) => {
        console.error("Error al actualizar email:", err);
        alert(err.error?.error || "Error al actualizar email");
      }
    });
  }

  // Actualizar Contraseña (Verificando la actual)
  updatePassword() {
    this.panelAccountService.updatePassword(this.passwordData).subscribe({
      next: () => {
        alert("Contraseña actualizada correctamente");
        this.passwordData = { current_password: '', new_password: '' };
      },
      error: (err) => {
        console.error("Error al actualizar contraseña:", err);
        alert(err.error?.error || "Error al actualizar contraseña");
      }
    });
  }
}
