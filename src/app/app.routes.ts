import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CatalogProductsComponent } from './products/catalog-products/catalog-products.component';
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'catalog-products', component: CatalogProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent}
];
