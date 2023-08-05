import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SuscripcionService } from '../../../services/suscripciones/suscripcion.service';
import { URL_IMGS } from 'src/environments/environment';
import { ProductoComponent } from '../../producto/producto.component';
import { ToastService } from '../../../services/toast/toast.service';
import { ProductosService } from '../../../services/productos/productos.service';
import { EmpaquesService } from '../../../services/empaques/empaques.service';
import { DireccionService } from '../../../services/direcciones/direccion.service';
import Swal from 'sweetalert2';
import { CarritoSuscripcionService } from '../../../services/carrito-suscripcion/carrito-suscripcion.service';
declare var $;
@Component({
  selector: 'app-mi-suscripcion',
  templateUrl: './mi-suscripcion.component.html',
  styleUrls: ['./mi-suscripcion.component.css'],
})
export class MiSuscripcionComponent implements OnInit {
  productos: any[] = [];
  empaques: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  metodo: string = 'Efectivo';
  contacto: string = 'Whatsapp';
  contactar: string = 'si';
  empaque: string = '';
  empaqueSeleccionado: any = {};
  _cantidadBolsa: number = 1;
  fechaEntrega: string;
  horaEntrega: string = '9:00am-11:00am';
  direccion: string = null;
  diaRecepcion: string = 'Lunes';
  listaDirecciones: any[] = [];
  datosUsuario: any[] = [];
  datosCarritoSuscripcion = {};
  idCarritoSus: string;
  constructor(
    private location: Location,
    private router: Router,
    private _suscripcionService: SuscripcionService,
    private _productoService: ProductosService,
    private _empaqueService: EmpaquesService,
    private _direccionService: DireccionService,
    private _toastService: ToastService,
    private _carritoSuscripcion: CarritoSuscripcionService
  ) {}

  ngOnInit(): void {
    this._empaqueService.get().subscribe((res: any) => {
      this.empaques = res.empaques;
      console.log(this.empaques);
      this.empaque = this.empaques[0]._id;
      this.empaqueSeleccionado = this.empaques[0];
    });
    this.datosUsuario.push(
      JSON.parse(localStorage.getItem('usuario_despachate#20211001'))
    );
    this._direccionService
      .getDireccionesxUsuario(this.datosUsuario[0]?._id)
      .subscribe((res: any) => {
        this.listaDirecciones = res;
        if (this.listaDirecciones.length > 0)
          this.direccion = this.listaDirecciones[0]._id;
      });
    this.consultarProductos();
  }
  back() {
    this.location.back();
  }
  consultarProductos() {
    this._carritoSuscripcion
      .UsuarioSuscripcion(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.idCarritoSus = res.carrito._id;
        this.metodo = res.carrito.metodoPago;
        this.contactar = res.carrito.contacto ? 'si' : 'no';
        this.contacto = res.carrito.formaContacto;
        this.empaque = res.carrito.empaque
          ? res.carrito.empaque._id
          : this.empaque;
        this.seleccionaEmpaque(this.empaque);
        this._cantidadBolsa = res.carrito.cantidadEmpaques;
        let cad = res.carrito.frecuenciaEntrega;

        if (!!cad) {
          let arr = `${cad}`.split('-');
          if (arr.length == 3) {
            this.fechaEntrega = cad;
            this.dateSelecte = new Date(`${cad}T00:00:00`);
          }
        }

        this.horaEntrega = res.carrito.horarioEntrega;
        console.log('datos carrito suscripción');
        console.log(res);
        this.direccion = res.carrito.direccion._id;
        this.diaRecepcion = res.carrito.diaRecepcion;
        if (res.existe) {
          this._suscripcionService
            .getXIdCarSus(res.carrito._id)
            .subscribe((products: any) => {
              console.log('DATOS PRODUCTOS');
              console.log(products);
              this.productos = products.detalleSuscripcion.filter(
                (detalle: any) =>
                  !!detalle.producto &&
                  !!detalle.paquete &&
                  detalle.subtotal > 0
              );
              products.detalleSuscripcion
                .filter(
                  (detalle: any) =>
                    !detalle.producto ||
                    !detalle.paquete ||
                    detalle.subtotal < 0
                )
                .forEach((detalle, index) => {
                  console.log(detalle);
                  this._suscripcionService
                    .delete(detalle._id)
                    .subscribe((res: any) => {
                      this._suscripcionService._toastService.showNotification(
                        'top',
                        'center',
                        'warning',
                        'Se ha quitado un elemento de tu suscripción por que fue eliminado el paquete o producto'
                      );
                    });
                });
            });
        }
      });
  }
  cantidad(index: number, sum: boolean) {
    let producto = this.productos[index];
    console.log(producto);
    if (sum) {
      this.productos[index].cantidad = this.productos[index].cantidad + 1;
      this.productos[index].subtotal =
        Math.round(
          (this.productos[index].subtotal +
            this.productos[index].paquete.precio) *
            100
        ) / 100;
      this._suscripcionService
        .update(this.productos[index]._id, this.productos[index])
        .subscribe((res: any) => {
          // console.log(res);
          this._productoService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Se modifico la cantidad del producto'
          );
        });
    } else {
      if (this.productos[index].cantidad > 1) {
        this.productos[index].cantidad = producto.cantidad - 1;
        this.productos[index].subtotal =
          Math.round(
            (this.productos[index].subtotal -
              this.productos[index].paquete.precio) *
              100
          ) / 100;
        this._suscripcionService
          .update(this.productos[index]._id, this.productos[index])
          .subscribe((res: any) => {
            // console.log(res);
            this._productoService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Se modifico la cantidad del producto'
            );
          });
      } else {
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'No se puede seleccionar menos de un producto'
        );
      }
    }
  }
  eliminarProducto(idProducto: string) {
    this._suscripcionService
      .deleteProducto(this.idCarritoSus, idProducto)
      .subscribe((res: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'success',
          'Se ha eliminado el producto de tu suscripción'
        );
        this.consultarProductos();
      });
  }
  cantidadBolsa(sum: boolean) {
    if (sum) {
      this._cantidadBolsa = this._cantidadBolsa + 1;
    } else {
      if (this._cantidadBolsa > 1) {
        this._cantidadBolsa = this._cantidadBolsa - 1;
      } else {
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'No se puede seleccionar menos de un producto'
        );
      }
    }
  }
  seleccionaEmpaque(id) {
    for (const e of this.empaques) {
      if (e._id == id) {
        this.empaqueSeleccionado = e;
      }
    }
  }
  registrarSuscripcion() {
    this.datosCarritoSuscripcion = {
      frecuenciaEntrega: this.fechaEntrega,
      horarioEntrega: this.horaEntrega,
      diaRecepcion: !!this.diaRecepcion ? this.diaRecepcion : 'Lunes',
      contacto: this.contactar === 'si' ? true : false,
      formaContacto: this.contacto,
      metodoPago: this.metodo,
      referenciaPago: 'aaaaaaaa',
      precioTotal: 0,
      cantidadTotal: 0,
      direccion: this.direccion,
      empaque: this.empaque,
      cantidadEmpaques: this._cantidadBolsa,
      usuario: this.datosUsuario[0]._id,
    };
    console.log(this.datosCarritoSuscripcion);
    this._carritoSuscripcion
      .UsuarioSuscripcion(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        console.log(this.datosUsuario[0]._id);

        if (!res.existe) {
          this._carritoSuscripcion
            .insert(this.datosCarritoSuscripcion)
            .subscribe((res: any) => {
              this._toastService.showNotification(
                'top',
                'center',
                'success',
                'Se ha creado tu suscripción exitosamente, ahora puedes agregar productos'
              );
              this.router.navigate(['/datosEntrega', 'suscripcion']);
            });
        } else {
          this._carritoSuscripcion
            .update(res.carrito._id, this.datosCarritoSuscripcion)
            .subscribe((res: any) => {
              this._toastService.showNotification(
                'top',
                'center',
                'success',
                'Se ha actualizado la información de tu suscripción'
              );
              this.router.navigate(['/datosEntrega', 'suscripcion']);
            });
        }
      });
  }
  eliminarSuscripcion() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro?',
        text: 'Esta acción no es reversible!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, eliminar!',
        cancelButtonText: 'No, cancelar!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          this._carritoSuscripcion
            .delete(this.idCarritoSus)
            .subscribe((res: any) => {
              console.log(res);
              if (res.ok) {
                this._suscripcionService
                  .deleteDetalles(this.idCarritoSus)
                  .subscribe((res2: any) => {
                    if (res2.ok) {
                      this._toastService.showNotification(
                        'top',
                        'center',
                        'success',
                        'Tu suscripción ha sido eliminada'
                      );
                      this.productos = [];
                    }
                  });
              }
            });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelado',
            'Tu registro se encuentra seguro :)',
            'error'
          );
        }
      });
  }
  dateSelecte: Date;
  fechaSeleccionada: string = '';
  onDateChange(objDate: any) {
    console.log(objDate);

    this.fechaSeleccionada = this.getDate(objDate);
    this.dateSelecte = objDate;
    this.fechaEntrega = this.fechaSeleccionada;
    console.log(this.fechaSeleccionada);
    this.ValidateDate();
  }
  getDate(date: Date) {
    let mm = date.getMonth() + 1; // getMonth() is zero-based
    let dd = date.getDate();

    return [
      date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd,
    ].join('-');
  }
  ValidateDate() {
    console.log('--------------Fecha seleccionada', this.fechaSeleccionada);
    let fsctd = new Date(`${this.fechaSeleccionada}T00:00:00`);
    let factl = new Date(`${this.getDate(new Date())}T00:00:00`);
    console.log(fsctd.getTime(), factl.getTime());
    if (fsctd.getTime() < factl.getTime()) {
      ///valida fechas anteriores
      console.log('--------------------fechas anteriores');
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'La fecha ya no es valida'
      );
      this.fechaSeleccionada = this.getDate(new Date()); // factl.toISOString().split('T')[0];
      this.dateSelecte = new Date();
    } else if (fsctd.getTime() > factl.getTime()) {
      ///Valida fechas posteriores
      console.log('--------------------fechas posteriores');
      console.log(
        'fecha posterior ',
        fsctd.getDate(),
        fsctd.getDay(),
        this.getDate(fsctd)
      );

      if (fsctd.getDay() === 5) {
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Los sabados no se cuenta con servicio de entrega despues de las 12'
        );
      } else if (fsctd.getDay() === 6) {
        ///valida los domingos
        this.fechaSeleccionada = this.getDate(
          new Date(fsctd.setDate(fsctd.getDate() + 2))
        );
        this.dateSelecte = new Date(fsctd);
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Los domingos no se cuenta con servicio de entrega'
        );
      }
    } else {
      ///Valida fecha actual
      console.log(
        '--------------------fechas actual',
        fsctd.getTime(),
        factl.getTime(),
        this.fechaSeleccionada,
        new Date().getHours(),
        fsctd.getDay(),
        fsctd.getDate()
      );

      if (new Date().getDay() === 6) {
        ///Valida sabados

        $('#inlineCheckboxMetodo3').prop('disabled', true);

        if (new Date().getHours() >= 9) {
          ///Valida el horario despues de las 12
          this.fechaSeleccionada = this.getDate(
            new Date(fsctd.setDate(fsctd.getDate() + 3))
          );
          this.dateSelecte = fsctd;
          this._productoService._toastService.showNotification(
            'top',
            'center',
            'warning',
            'Los sabados no se cuenta con servicio de entrega despues de las 12'
          );
        }
      } else if (new Date().getDay() === 0) {
        ///valida domingos
        this.fechaSeleccionada = this.getDate(
          new Date(fsctd.setDate(fsctd.getDate() + 2))
        );
        this.dateSelecte = fsctd;
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Los domingos no se cuenta con servicio de entrega'
        );
      } else {
        ///Valida cualquier dia de la semana excepto los anteriores
        console.log(
          '--------------Horarios entre semana',
          new Date().getHours()
        );
        if (new Date().getHours() >= 9 && new Date().getHours() < 12) {
          ///Valida horario despues de las 9
          console.log('---------------horas >= 9 ', new Date().getHours());
          // this.horario = '12:00pm - 4:00pm';
        } else if (new Date().getHours() >= 12 && new Date().getHours() < 16) {
          ///Valida horario despues de las 12
          console.log('---------------horas >= 12 ', new Date().getHours());
        } else if (new Date().getHours() >= 16) {
          ///Valida horario despues de las 4
          console.log('---------------horas >= 4 ', new Date().getHours());
          this.fechaSeleccionada = this.getDate(
            new Date(fsctd.setDate(fsctd.getDate() + 2))
          );
          this.dateSelecte = new Date(fsctd);
          $('#inlineCheckboxMetodo1').prop('disabled', false);
          $('#inlineCheckboxMetodo2').prop('disabled', false);
          $('#inlineCheckboxMetodo3').prop('disabled', false);
        }
      }
    }
    console.log('Fecha seleccionada', this.fechaSeleccionada);
  }

  vaciarLista() {
    this.recursividad_vaciado_lista(0);
  }

  recursividad_vaciado_lista(pos) {
    if (pos < this.productos.length) {
      this._suscripcionService
        .deleteProducto(this.idCarritoSus, this.productos[pos].paquete._id)
        .subscribe((res: any) => {
          this.recursividad_vaciado_lista(pos + 1);
        });
    } else {
      this._toastService.showNotification(
        'top',
        'center',
        'success',
        'Se han eliminado los productos de tu suscripción'
      );
      this.consultarProductos();
    }
  }
}
