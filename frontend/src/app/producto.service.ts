import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/productos/';

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?search=${nombre}`);
  }

  crearProducto(datos: any, archivo: File | null): Observable<any> {
    const formData = this.crearFormData(datos, archivo);
    return this.http.post(this.apiUrl, formData);
  }

  actualizarProducto(id: number, datos: any, archivo: File | null): Observable<any> {
    const formData = this.crearFormData(datos, archivo);
    return this.http.put(`${this.apiUrl}${id}/`, formData);
  }

  borrarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  private crearFormData(datos: any, archivo: File | null): FormData {
    const formData = new FormData();
    formData.append('nombre', datos.nombre);
    formData.append('fecha', datos.fecha);
    formData.append('valor', datos.valor);
    formData.append('moneda', datos.moneda);
    if (archivo) formData.append('imagen', archivo);
    return formData;
  }
}