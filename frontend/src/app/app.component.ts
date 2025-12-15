import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from './producto.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DecimalPipe]
})
export class AppComponent implements OnInit {
  productoService = inject(ProductoService);
  
  nombre: string = '';
  fecha: string = '';
  valor: number | null = null;
  moneda: string = 'CLP';
  imagenSeleccionada: File | null = null;
  
  listaProductos: any[] = [];
  monedasDisponibles = [
  { code: 'CLP', name: 'Peso Chileno' },
  { code: 'USD', name: 'Dólar Estadounidense' },
  { code: 'EUR', name: 'Euro' },
  { code: 'ARS', name: 'Peso Argentino' },
  { code: 'MXN', name: 'Peso Mexicano' },
  { code: 'BRL', name: 'Real Brasileño' },
  { code: 'PEN', name: 'Sol Peruano' },
  { code: 'COP', name: 'Peso Colombiano' },
  { code: 'UF',  name: 'Unidad de Fomento' }];

  intentoGuardar: boolean = false;

  mostrarModalDuplicado: boolean = false;
  productoDuplicadoEncontrado: any = null;

  ngOnInit() {
    this.establecerFechaHoy();
    this.cargarProductos();
  }

  establecerFechaHoy() {
    this.fecha = new Date().toISOString().split('T')[0];
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe(data => this.listaProductos = data);
  }

  onFileSelected(event: any) {
    this.imagenSeleccionada = event.target.files[0];
  }

  iniciarGuardado() {
    this.intentoGuardar = true;

    if (!this.nombre || !this.fecha || this.valor === null) {
      return; 
    }

    if (this.valor < 0) {
      alert('❌ Error: El valor no puede ser negativo.');
      return;
    }

    this.productoService.buscarPorNombre(this.nombre).subscribe(resultados => {
      const exacto = resultados.find(p => p.nombre.toLowerCase() === this.nombre.toLowerCase());

      if (exacto) {
        this.productoDuplicadoEncontrado = exacto;
        this.mostrarModalDuplicado = true;
      } else {
        this.continuarGuardado(false);
      }
    });
  }

  continuarGuardado(esReemplazo: boolean) {
    if (this.valor === 0) {
      if (!confirm('⚠️ El precio es 0. ¿Está seguro que desea guardar?')) return;
    }

    const fechaIngresada = new Date(this.fecha);
    const fechaHoy = new Date();
    fechaHoy.setHours(0,0,0,0);
    fechaIngresada.setHours(24,0,0,0);

    if (fechaIngresada < fechaHoy) {
      if (!confirm('📅 La fecha es anterior a hoy. ¿Desea continuar?')) return;
    }

    if (!this.imagenSeleccionada && !esReemplazo) {
       if (!confirm('🖼️ Está subiendo el producto sin imagen. ¿Desea continuar?')) return;
    }

    const datos = {
      nombre: this.nombre,
      fecha: this.fecha,
      valor: this.valor,
      moneda: this.moneda
    };

    if (esReemplazo && this.productoDuplicadoEncontrado) {
      this.productoService.actualizarProducto(this.productoDuplicadoEncontrado.id, datos, this.imagenSeleccionada)
        .subscribe(() => this.finalizarProceso('Producto reemplazado con éxito'));
    } else {
      this.productoService.crearProducto(datos, this.imagenSeleccionada)
        .subscribe(() => this.finalizarProceso('Producto guardado con éxito'));
    }
  }

  resolverDuplicado(accion: 'agregar' | 'reemplazar' | 'cancelar') {
    this.mostrarModalDuplicado = false;
    if (accion === 'cancelar') return;

    if (accion === 'agregar') {
      this.continuarGuardado(false);
    } 
    else if (accion === 'reemplazar') {
      this.continuarGuardado(true);
    }
  }

  finalizarProceso(mensaje: string) {
    alert(`✅ ${mensaje}`);
    this.cargarProductos();
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nombre = '';
    this.establecerFechaHoy();
    this.valor = null;
    this.moneda = 'CLP';
    this.imagenSeleccionada = null;
    this.intentoGuardar = false;
    this.productoDuplicadoEncontrado = null;
    (document.getElementById('fileInput') as HTMLInputElement).value = '';
  }

  borrarProducto(id: number, nombre: string) {
    if (confirm(`🗑️ ¿Seguro que desea eliminar "${nombre}"?`)) {
      this.productoService.borrarProducto(id).subscribe(() => {
        this.cargarProductos();
      });
    }
  }
  obtenerFormatoMoneda(moneda: string): string {
    if (moneda === 'CLP' || moneda === 'UF' || moneda === 'PYG' || moneda === 'COP') {
      return '1.0-0';
    }
    return '1.2-2';
  }  
}