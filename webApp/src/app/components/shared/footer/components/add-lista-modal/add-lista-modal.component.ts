import { Component, OnInit } from '@angular/core';
import { ListaComprasService } from 'src/app/services/listas-compras/lista-compras.service';
import { OfertaService } from 'src/app/services/oferta/oferta.service';
import { ToastService } from 'src/app/services/toast/toast.service';
declare var $;

@Component({
  selector: 'footer-add-lista-modal',
  templateUrl: './add-lista-modal.component.html',
  styleUrls: ['./add-lista-modal.component.css'],
})
export class AddListaModalComponent implements OnInit {
  listas_compras: any[] = [];
  new_lista: string = '';
  createLista: boolean = false;
  _producto;
  _paquete: any = {};
  _cantidad: number = 1;
  lista_model: string = '';
  constructor(
    public _listaCompraservie: ListaComprasService,
    private _toastService: ToastService,
    private _ofertaService: OfertaService
  ) {}

  ngOnInit(): void {}

  get listas(): any[] {
    return this._listaCompraservie.lista;
  }

  toggleCreateLista() {
    this.createLista = !this.createLista;
  }

  agregarProductoALista() {
    if (this.createLista) {
      this.createListaCompra();
      this.lista_model = this.new_lista;
      this.new_lista = '';
      this.createLista = false;
    }

    if (this.lista_model == undefined || this.lista_model == '') return;

    if (!!this._listaCompraservie.producto_a_lista) {
      this._producto = this._listaCompraservie.producto_a_lista;
      this._paquete = this._listaCompraservie.paquete_a_lista;
      this._cantidad = this._listaCompraservie.cantidad_a_lista;
      if (this._producto.status != 'Agotado') {
        this._ofertaService
          .getXProducto(this._producto._id)
          .subscribe((res: any) => {
            if (res.oferta) {
              console.log(res.oferta);
              if (res.oferta.inventario.stock > 0) {
                this._toastService.showNotification(
                  'top',
                  'center',
                  'success',
                  'Este producto tiene oferta'
                );
                this._paquete = res.oferta.inventario;
                this._paquete.precio = res.oferta.precio;
                this._listaCompraservie.agregarAlCarrito(
                  this._producto,
                  this._cantidad,
                  this._paquete,
                  res.oferta.precio,
                  this.lista_model
                );
              } else {
                this._listaCompraservie.agregarAlCarrito(
                  this._producto,
                  this._cantidad,
                  this._paquete,
                  0,
                  this.lista_model
                );
              }
            } else {
              if (this._paquete.stock > 0) {
                this._listaCompraservie.agregarAlCarrito(
                  this._producto,
                  this._cantidad,
                  this._paquete,
                  0,
                  this.lista_model
                );
              } else {
                this._toastService.showNotification(
                  'top',
                  'center',
                  'warning',
                  'Este producto no tiene stock'
                );
              }
            }
            this._producto = undefined;
            $('#modalAddProductoLista').modal('hide');
          });
      } else {
        $('#modalAddProductoLista').modal('hide');
        this._producto = undefined;
        this._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Este producto se encuentra agotado'
        );
      }
    } else {
      $('#modalAddProductoLista').modal('hide');
      this._producto = undefined;
    }
  }
  createListaCompra() {
    this._listaCompraservie.agregarLista(this.new_lista);
  }
}
