import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito/carrito.service';
import { ProductosService } from '../../services/productos/productos.service';
import { URL_IMGS } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  productos: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  subtotal: number = 0;
  constructor(
    private _carritoService: CarritoService,
    private _productoService: ProductosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productos = this._carritoService.lista;
    this.calcularSubtotal();
    console.log(this.productos);
  }

  cantidad(index: number, sum: boolean) {
    let producto = this.productos[index];
    if (sum) {
      if (producto.paquete.stock > producto.cantidad) {
        producto.cantidad = producto.cantidad + 1;
        producto.total =
          Math.round((producto.total + producto.paquete.precio) * 100) / 100;
      } else {
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'No hay suficiente stock del producto'
        );
      }
    } else {
      if (producto.cantidad > 1) {
        producto.cantidad = producto.cantidad - 1;
        producto.total =
          Math.round((producto.total - producto.paquete.precio) * 100) / 100;
      } else {
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'No se puede seleccionar menos de un producto'
        );
      }
    }
    this._carritoService.guardarCarrito(this.productos);
    this.calcularSubtotal();
  }
  calcularSubtotal() {
    this.subtotal = 0;
    for (const producto of this.productos) {
      this.subtotal += Math.round(producto.total * 100) / 100;
    }
  }
  continuarCompra() {
    this._carritoService.guardarCarrito(this.productos);
    this.router.navigate(['/datosEntrega']);
  }
  seguirCompra() {
    this._carritoService.guardarCarrito(this.productos);
    this.router.navigate(['/catalogo']);
  }
  eliminarProducto(id, pqtId?) {
    this._carritoService.eliminarItem(id).then(() => {
      this.productos = this._carritoService.lista;
    });
  }

  vaciarCarrito() {
    this.recursividad_vaciado_carrito(0);
  }
  recursividad_vaciado_carrito(pos) {
    if (pos < this.productos.length) {
      this._carritoService
        .eliminarItem(this.productos[pos].paquete._id)
        .then(() => {
          this.recursividad_vaciado_carrito(pos + 1);
        });
    } else {
      this.productos = this._carritoService.lista;
    }
  }
}
