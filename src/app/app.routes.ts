import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CatalogProductsComponent } from './products/catalog-products/catalog-products.component';
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminComponent } from './admin/admin.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminUsuariosComponent } from './admin/admin-usuarios/admin-usuarios.component';
import { AdminReportesComponent } from './admin/admin-reportes/admin-reportes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'catalog-products', component: CatalogProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},


  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protegemos el admin con un guard
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'reportes', component: AdminReportesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // Si entran a /admin, va al dashboard
    ]
  }
];
