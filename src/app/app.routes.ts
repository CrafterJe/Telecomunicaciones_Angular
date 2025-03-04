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
import { AdminProductosComponent } from './admin/admin-productos/admin-productos.component';
import { CheckoutComponent } from './payment/checkout/checkout.component';
import { AccountLayoutComponent } from './layouts/account-layout/account-layout.component';
import { AccountComponent } from './account/account/account.component';
import { ConfigComponent } from './account/config/config.component';
import { ProfileComponent } from './account/profile/profile.component';
import { AddressesComponent } from './account/addresses/addresses.component';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'catalog-products', component: CatalogProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'checkout', component: CheckoutComponent},


  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protegemos el admin con un guard
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'productos', component: AdminProductosComponent },
      { path: 'reportes', component: AdminReportesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // Si entran a /admin, va al dashboard
    ]
  },
  {
    path : 'account',
    component : AccountLayoutComponent,
    children: [
      { path : 'account' , component: AccountComponent},
      { path : 'config' , component: ConfigComponent},
      { path : 'profile' , component: ProfileComponent},
      { path : 'addresses' , component: AddressesComponent},
      { path : '', redirectTo: 'profile', pathMatch: 'full' } // si entran va  a /account
    ]
  }
];
