import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ListaComprasService } from 'src/app/services/listas-compras/lista-compras.service';
import { ProductosService } from 'src/app/services/productos/productos.service';
import { URL_IMGS } from 'src/environments/environment';
declare var $;
@Component({
  selector: 'app-mis-listas-super',
  templateUrl: './mis-listas-super.component.html',
  styleUrls: ['./mis-listas-super.component.css'],
})
export class MisListasSuperComponent implements OnInit {
  productos: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  subtotal: number = 0;
  constructor(
    private _carritoService: ListaComprasService,
    private _productoService: ProductosService,
    private router: Router
  ) {}
  form_registro_lista: FormGroup
  ngOnInit(): void {
    this.productos = this._carritoService.lista;
    this.calcularSubtotal();
    console.log(this.productos);
    this.form_registro_lista = new FormGroup({
      nombre: new FormControl(null)
    })
  }
  registrar_lista(){
    const obj = this.form_registro_lista.value;
    console.log('fomr', obj)
    if(!!obj.nombre) {
      this._carritoService.agregarLista(obj.nombre).then((reg) => {
        console.log('result', reg);
        if(!!reg) {
          this.form_registro_lista.get('nombre').setValue(null);
          this.productos = this._carritoService.lista
          $('#modalAddListaCompras').modal('hide')
        }
      })
    }
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
    /* this._carritoService.guardarCarrito(this.productos); */
    this.calcularSubtotal();
  }
  calcularSubtotal() {
    this.subtotal = 0;
    for (const producto of this.productos) {
      this.subtotal += Math.round(producto.total * 100) / 100;
    }
  }
  continuarCompra() {
    /* this._carritoService.guardarCarrito(this.productos); */
    this.router.navigate(['/datosEntrega']);
  }
  seguirCompra() {
    /* this._carritoService.guardarCarrito(this.productos); */
    this.router.navigate(['/catalogo']);
  }
  eliminarLista(idx) {
    let reg = this.productos[idx];
    this._carritoService.eliminarItem(reg).then((reg) => {
      this.productos = this._carritoService.lista
    })
  }
  eliminarProducto(nombre_lista, idx) {
    console.log('eliminar item',nombre_lista, idx)
    this._carritoService.eliminarItemDetalle(nombre_lista, idx).then(() => {
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
