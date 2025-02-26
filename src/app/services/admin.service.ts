import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { API_URL } from '../config/api.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('❌ No hay token en localStorage. Asegúrate de haber iniciado sesión.');
      throw new Error("No hay token disponible");
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener total de usuarios y productos
  getTotalUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios/total`, { headers: this.getHeaders() });
  }

  getTotalProductos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/productos/total`, { headers: this.getHeaders() });
  }

  // Obtener usuarios
  getUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios`, { headers: this.getHeaders() });
  }

  // Actualizar rol de usuario
  actualizarRol(id: string, nuevoRol: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/admin/usuarios/${id}/rol`,
      { rol: nuevoRol },
      { headers: this.getHeaders() }
    );
  }

  // Eliminar usuario
  deleteUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/usuarios/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener productos
  getProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/productos`, {
      headers: this.getHeaders()
    });
  }


  // Agregar producto con imágenes y video
  addProduct(productData: any): Observable<any> {
    const formData = new FormData();

    // ✅ Validar y agregar datos básicos
    formData.append('nombre', productData.nombre || '');
    formData.append('tipo', productData.tipo || '');

    // ✅ Validar y agregar valores numéricos correctamente
    const precio = Number(productData.precio);
    const stock = Number(productData.stock);

    if (isNaN(precio) || isNaN(stock)) {
      throw new Error('❌ El precio y el stock deben ser números válidos.');
    }

    formData.append('precio', precio.toString());
    formData.append('stock', stock.toString());

    // ✅ Convertir especificaciones en JSON
    if (productData.especificaciones) {
      formData.append('especificaciones', JSON.stringify(productData.especificaciones));
    }

    // ✅ Adjuntar imágenes (máximo 5)
    if (productData.imagenes && productData.imagenes.length > 0) {
      productData.imagenes.slice(0, 5).forEach((imagen: File) => {
        formData.append('imagenes', imagen);
      });
    }

    // ✅ Agregar enlace de video si existe
    if (productData.videoLink) {
      formData.append('videoLink', productData.videoLink);
    }

    // 🚀 Enviar solicitud POST al backend
    return this.http.post<any>(`${this.apiUrl}/admin/productos`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }),
    }).pipe(
      catchError((error) => {
        console.error('❌ Error al agregar el producto:', error);
        return throwError(() => new Error('Error al agregar el producto. Verifica los datos.'));
      })
    );
  }


  // Actualizar producto
  updateProduct(id: string, productData: any): Observable<any> {
    // Verificar si productData es FormData o un objeto normal
    if (productData instanceof FormData) {
      // Si ya es FormData, no necesitamos hacer otra validación aquí
      // ya que se validó en el componente
      console.log('Actualizando producto con FormData');

      // Añadir logs para depuración
      console.log('FormData entries:');
      if (typeof productData.entries === 'function') {
        for (let pair of productData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      return this.http.put<any>(`${this.apiUrl}/admin/productos/${id}`, productData, {
        headers: this.getHeaders(),
      }).pipe(
        catchError((error) => {
          console.error('❌ Error al actualizar el producto:', error);
          return throwError(() => new Error('Error al actualizar el producto. Verifica los datos.'));
        })
      );
    } else {
      // Si es un objeto normal, crear un nuevo FormData
      const formData = new FormData();

      // Validar y convertir datos básicos
      formData.append('nombre', productData.nombre || '');
      formData.append('tipo', productData.tipo || '');

      // Convertir precio y stock correctamente
      let precio, stock;

      try {
        precio = typeof productData.precio === 'number' ?
          productData.precio : parseFloat(String(productData.precio).replace(',', '.'));

        stock = typeof productData.stock === 'number' ?
          productData.stock : parseInt(String(productData.stock), 10);

        // Verificar que sean números válidos después de la conversión
        if (isNaN(precio) || isNaN(stock)) {
          console.error('❌ Conversión fallida. Precio:', productData.precio, 'Stock:', productData.stock);
          throw new Error('❌ El precio y el stock deben ser números válidos.');
        }
      } catch (error) {
        console.error('❌ Error en la conversión de números:', error);
        return throwError(() => new Error('❌ El precio y el stock deben ser números válidos.'));
      }

      formData.append('precio', precio.toString());
      formData.append('stock', stock.toString());

      console.log('Precio convertido:', precio);
      console.log('Stock convertido:', stock);

      // Convertir especificaciones en JSON
      if (productData.especificaciones) {
        formData.append('especificaciones', JSON.stringify(productData.especificaciones));
      }

      // Adjuntar imágenes (máximo 5)
      if (productData.imagenes && productData.imagenes.length > 0) {
        productData.imagenes.slice(0, 5).forEach((imagen: File) => {
          formData.append('imagenes', imagen);
        });
      }

      // Agregar enlace de video si existe
      if (productData.videoLink) {
        formData.append('videoLink', productData.videoLink);
      }

      // Enviar solicitud PUT al backend
      return this.http.put<any>(`${this.apiUrl}/admin/productos/${id}`, formData, {
        headers: this.getHeaders(),
      }).pipe(
        catchError((error) => {
          console.error('❌ Error al actualizar el producto:', error);
          return throwError(() => new Error('Error al actualizar el producto. Verifica los datos.'));
        })
      );
    }
  }


  // Eliminar producto
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/productos/${id}`, { headers: this.getHeaders() });
  }
}
