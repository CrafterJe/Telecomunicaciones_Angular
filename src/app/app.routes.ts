import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CatalogProductsComponent } from './products/catalog-products/catalog-products.component';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'catalog-products', component: CatalogProductsComponent },
];
