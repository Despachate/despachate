import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { URL_IMGS } from '../../../environments/environment';
import { FavoritosService } from '../../services/favoritos/favoritos.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { CarritoService } from '../../services/carrito/carrito.service';
import { SuscripcionService } from '../../services/suscripciones/suscripcion.service';
import { CarritoSuscripcionService } from '../../services/carrito-suscripcion/carrito-suscripcion.service';
import { ToastService } from '../../services/toast/toast.service';
import { Router } from '@angular/router';
import { OfertaService } from '../../services/oferta/oferta.service';
import { ProductosService } from '../../services/productos/productos.service';
import { InventarioService } from '../../services/inventario/inventario.service';
import { EmpaquesService } from 'src/app/services/empaques/empaques.service';
import { DireccionService } from 'src/app/services/direcciones/direccion.service';
import { ListaComprasService } from 'src/app/services/listas-compras/lista-compras.service';

@Component({
  selector: 'app-card-producto',
  templateUrl: './card-producto.component.html',
  styleUrls: ['./card-producto.component.css'],
})
export class CardProductoComponent implements OnInit {
  @Output() onAddCarrito: EventEmitter<any> = new EventEmitter<any>();
  @Input('producto') set producto(producto: any) {
    this._producto = producto;
    if (this._producto != null && this._producto.img) {
      this._img = this._producto.img;
    }
  }
  @Input('style') set style(style: string) {
    if (
      style === 'card1' ||
      style === 'card2' ||
      style === 'card3' ||
      style === 'card4' ||
      style === 'cardRedonda' ||
      style === 'cardCatalogo'
    ) {
      this._style = style;
    }
  }
  _producto: any = {};
  _img: string = '';
  _inventario: any[] = [];
  _paquete: any = {};
  _cantidad: number = 1;
  isFavorito = false;
  _favorito: any = {};
  precioAnterior: number = 0;
  _style: string = 'card1';
  url: string = `${URL_IMGS}productos/`;

  ///SUSCRIPCION
  metodo: string = 'Efectivo';
  contacto: string = 'Whatsapp';
  contactar: string = 'si';
  empaque: string = '';
  empaqueSeleccionado: any = {};
  _cantidadBolsa: number = 1;
  fechaEntrega: string = 'cada Semana';
  horaEntrega: string = '9:00am-12:00pm';
  direccion: string = null;
  diaRecepcion: string = 'Lunes';
  listaDirecciones: any[] = [];
  datosUsuario: any[] = [];
  datosCarritoSuscripcion = {};
  idCarritoSus: string;

  constructor(
    private _favoritoService: FavoritosService,
    private _usuariosService: UsuariosService,
    private _carritoService: CarritoService,
    private _suscripcionService: SuscripcionService,
    private _carritoSuscripcion: CarritoSuscripcionService,
    private _toastService: ToastService,
    private router: Router,
    private _inventarioService: InventarioService,
    private _ofertaService: OfertaService,
    private _empaqueService: EmpaquesService,
    private _direccionService: DireccionService,
    private _listaCompras: ListaComprasService
  ) { }
 seleccionaALista() {
  this._listaCompras.producto_a_lista = this._producto;
  this._listaCompras.paquete_a_lista = this._paquete;
  this._listaCompras.cantidad_a_lista = this._cantidad;
 }
  ngOnInit(): void {

    this._inventarioService
      .getById(this._producto._id)
      .subscribe((res: any) => {
        this.getFavoritos();
        if (res.inventario.length > 0) {
          this._inventario = res.inventario;
          this._paquete = res.inventario[0];
          this._ofertaService
            .getXProducto(this._producto._id)
            .subscribe((reso: any) => {
              if (reso.oferta) {
                // console.log(reso.oferta);
                if (reso.oferta.inventario.stock > 0) {
                  //this._toastService.showNotification('top','center','success','Este producto tiene oferta');
                  for (const paquete of res.inventario) {
                    if (paquete._id === reso.oferta.inventario._id) {
                      this._paquete = paquete;
                      this.precioAnterior = paquete.precio;
                      this._paquete.precio = reso.oferta.precio;
                    }
                  }
                } else {
                }
              } else {
              }
            });
        }
      });
  }

  getFavoritos() {
    let usuario = this._usuariosService.usuario;
    if (usuario !== null) {
      this._favoritoService
        .getProductosFavoritos(this._producto._id, usuario._id)
        .subscribe((res: any) => {
          if (res.favorito) {
            this.isFavorito = true;
            this._favorito = res.favorito;
          } else {
            this.isFavorito = false;
          }
        });
    }
  }

  favorito() {
    if (this._usuariosService.estaLogueado()) {
      let usuario = this._usuariosService.usuario;
      this._favoritoService
        .getProductosFavoritos(this._producto._id, usuario._id)
        .subscribe((res3: any) => {
          if (usuario != null) {
            if (this.isFavorito) {
              this._favoritoService
                .delete(this._favorito._id)
                .subscribe((res: any) => {
                  console.log(res);
                  this._favoritoService._toastService.showNotification(
                    'top',
                    'center',
                    'success',
                    'Se quito correctamente de tus favoritos'
                  );
                  this.getFavoritos();
                });
            } else {
              if (!res3.ok) {
                this._favoritoService
                  .insert({ producto: this._producto._id, usuario })
                  .subscribe((res: any) => {
                    console.log(res);
                    this._favoritoService._toastService.showNotification(
                      'top',
                      'center',
                      'success',
                      'Se agrego correctamente a tus favoritos'
                    );
                    this.getFavoritos();
                  });
              } else {
                this.isFavorito = true;
              }
            }
          } else {
            this._favoritoService._toastService.showNotification(
              'top',
              'center',
              'danger',
              'No has iniciado sesión'
            );
          }
        });
    } else {
      this._favoritoService._toastService.showNotification(
        'top',
        'center',
        'danger',
        'No has iniciado sesión'
      );
    }
  }

  selectPaquete(paquete: any) {
    this._paquete = paquete;
    this.precioAnterior = 0;
    this._ofertaService
      .getXProducto(this._producto._id)
      .subscribe((reso: any) => {
        if (reso.oferta) {
          console.log(reso.oferta);
          if (reso.oferta.inventario.stock > 0) {
            //this._toastService.showNotification('top','center','success','Este producto tiene oferta');

            if (paquete._id === reso.oferta.inventario._id) {
              this._paquete = paquete;
              this.precioAnterior = reso.oferta.inventario.precio;
              this._paquete.precio = reso.oferta.precio;
            }
          } else {
          }
        } else {
        }
      });
    console.log(this._paquete);
  }

  changeCantidad(flag: boolean = true) {
    if (flag) {
      if (this._paquete.stock > this._cantidad) {
        this._cantidad++;
      } else {
        this._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Stock insuficiente'
        );
      }
    } else {
      if (this._cantidad > 1) {
        this._cantidad--;
      } else {
        this._toastService.showNotification(
          'top',
          'center',
          'warning',
          'La cantidad no puede ser menor a 1'
        );
      }
    }
  }

  addCarrito() {
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
              this._carritoService.agregarAlCarrito(
                this._producto,
                this._cantidad,
                this._paquete,
                res.oferta.precio
              );
            } else {
              this._carritoService.agregarAlCarrito(
                this._producto,
                this._cantidad,
                this._paquete
              );
            }
          } else {
            if (this._paquete.stock > 0) {
              this._carritoService.agregarAlCarrito(
                this._producto,
                this._cantidad,
                this._paquete
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
          this.onAddCarrito.emit(true);
        });
    } else {
      this._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Este producto se encuentra agotado'
      );
    }
  }
  addSuscripcion() {
    if (this._producto.status != 'Agotado') {
      let usuario = this._usuariosService.usuario;
      if (usuario != null && usuario._id) {
        this._carritoSuscripcion
          .UsuarioSuscripcion(usuario._id)
          .subscribe((res1: any) => {
            if (res1.existe) {
              this.agregarASuscripcion(res1.carrito._id);
            } else {
              // this._toastService.showNotification('top','center','warning','Registra tus datos para poder agregar productos a tu suscripción');
              // this.router.navigate(['/miSuscripcion']);
              this.registrarSuscripcion();
            }
          });
      } else {
        this._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Inicia sesión para poder agregar productos a tu suscripción'
        );
      }
    } else {
      this._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Este producto se encuentra agotado'
      );
    }
  }

  agregarASuscripcion(id) {
    let idCarritoSuscripcion = id;
    let datosDetalleSuscripcion = {
      cantidad: this._cantidad,
      subtotal: this._paquete.precio,
      carritoSuscripcion: idCarritoSuscripcion,
      producto: this._producto._id,
      paquete: this._paquete._id,
    };
    this._suscripcionService
      .getProducto(idCarritoSuscripcion, this._paquete._id)
      .subscribe((res: any) => {
        console.log(res.existe);
        if (res.existe) {
          let cantidad: Number = res.detalleSus.cantidad + this._cantidad;
          this._suscripcionService
            .updateCantidadProductos(idCarritoSuscripcion, this._paquete._id, {
              cantidad: cantidad + '',
            })
            .subscribe((res2: any) => {
              this._toastService.showNotification(
                'top',
                'center',
                'success',
                `Producto sumo ${this._cantidad} producto a tu suscripción Correctamente`
              );
            });
        } else {
          this._suscripcionService
            .insert(datosDetalleSuscripcion)
            .subscribe((res: any) => {
              console.log(res);
              this._toastService.showNotification(
                'top',
                'center',
                'success',
                'Producto agregado a tu suscripción Correctamente'
              );
            });
        }
      });

    // this._inventarioService.getById(this._producto._id).subscribe((res:any)=>{
    //   console.log(res);

    //     if(res.inventario.length > 0){
    //       let inventarioSeleccionado: any = {}
    //       res.inventario.forEach(element => {
    //         if(element.stock > 0){
    //           inventarioSeleccionado = element;
    //           console.log(this._producto);
    //           return;
    //         }else{
    //           inventarioSeleccionado = null;
    //         }
    //       });

    //       if(inventarioSeleccionado != null){

    //         let idCarritoSuscripcion = id;
    //         let datosDetalleSuscripcion = {
    //           cantidad:1,
    //           subtotal: inventarioSeleccionado.precio,
    //           carritoSuscripcion: idCarritoSuscripcion,
    //           producto: this._producto._id,
    //           paquete: inventarioSeleccionado._id
    //         };
    //         console.log("datos que tiene que llevar para agregar un producto a suscripcion",datosDetalleSuscripcion);
    //         this._suscripcionService.getProducto(idCarritoSuscripcion,inventarioSeleccionado._id).subscribe((res:any)=>{
    //           console.log(res.existe);
    //           if(res.existe){
    //             let cantidad: Number = res.detalleSus.cantidad + 1;
    //             this._suscripcionService.updateCantidadProductos(idCarritoSuscripcion,inventarioSeleccionado._id,{cantidad:cantidad+''}).subscribe((res2:any)=>{
    //               this._toastService.showNotification('top','center','success','Producto sumo 1 producto a tu suscripción Correctamente');
    //             });
    //           }else{
    //             this._suscripcionService.insert(datosDetalleSuscripcion).subscribe((res:any)=>{
    //               console.log(res);
    //               this._toastService.showNotification('top','center','success','Producto agregado a tu suscripción Correctamente');
    //             });
    //           }
    //         });
    //       }else{
    //         this._toastService.showNotification('top','center','warning','No hay inventario para este producto');
    //       }
    //     }else{
    //       this._toastService.showNotification('top','center','warning','No hay inventario para este producto');
    //     }
    // });
  }
  registrarSuscripcion() {
    let idUser = this._usuariosService.usuario._id;
    this._direccionService
      .getDireccionesxUsuario(idUser)
      .subscribe((res: any) => {
        this.listaDirecciones = res;
        if (res.length > 0) {
          this.direccion = res[0]._id;
          this._empaqueService.get().subscribe((res: any) => {
            this.empaque = res.empaques[0]._id;
            let datosCarritoSuscripcion = {
              frecuenciaEntrega: this.fechaEntrega,
              horarioEntrega: this.horaEntrega,
              diaRecepcion: this.diaRecepcion,
              contacto: this.contactar === 'si' ? true : false,
              formaContacto: this.contacto,
              metodoPago: this.metodo,
              referenciaPago: 'Suscripción',
              precioTotal: 0,
              cantidadTotal: 0,
              direccion: this.direccion,
              empaque: this.empaque,
              cantidadEmpaques: this._cantidadBolsa,
              usuario: idUser,
            };
            this._carritoSuscripcion
              .insert(datosCarritoSuscripcion)
              .subscribe((res: any) => {
                this._toastService.showNotification(
                  'top',
                  'center',
                  'success',
                  'Se ha creado tu suscripción exitosamente, ahora puedes agregar productos'
                );
                this.agregarASuscripcion(res.carrito._id);
              });
          });
        } else {
          this._toastService.showNotification(
            'top',
            'center',
            'warning',
            'Registra tus datos de dirección de envío para poder agregar productos a tu suscripción'
          );
          this.router.navigate(['/miCuenta']);
        }
      });
  }
}
