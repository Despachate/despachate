import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { cps } from 'src/app/config/config';
import { CarritoSuscripcionService } from 'src/app/services/carrito-suscripcion/carrito-suscripcion.service';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { CuponesService } from 'src/app/services/cupones/cupones.service';
import { CuponesDescuentosService } from 'src/app/services/cuponesDescuentos/cupones-descuentos.service';
import { DireccionService } from 'src/app/services/direcciones/direccion.service';
import { DonacionService } from 'src/app/services/donacion/donacion.service';
import { EmpaquesService } from 'src/app/services/empaques/empaques.service';
import { ListaComprasService } from 'src/app/services/listas-compras/lista-compras.service';
import { MailingService } from 'src/app/services/mailing/mailing.service';
import { ProductosService } from 'src/app/services/productos/productos.service';
import { StripeService } from 'src/app/services/stripe/stripe.service';
import { SuscripcionService } from 'src/app/services/suscripciones/suscripcion.service';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { VentasService } from 'src/app/services/ventas/ventas.service';
import { URL_IMGS, environment } from 'src/environments/environment';
declare var $;
declare var paypal;
@Component({
  selector: 'app-mis-listas-datos-entrega',
  templateUrl: './mis-listas-datos-entrega.component.html',
  styleUrls: ['./mis-listas-datos-entrega.component.css'],
})
export class MisListasDatosEntregaComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  cps = cps;
  totalDonado: number = 0;
  productos: any[] = [];
  listaDirecciones: any[] = [];
  productosRelacionados: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  urlDonacion: string = `${URL_IMGS}donaciones/`;
  public datosUsuario: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  cantidadTotal: number = 0;
  donacion: number = 0;
  RFC: string = null;
  campoFecha = false;
  _cupon: any = null;
  _codigo: string = '';
  costoEnvio: number = 39;
  totalEmpaque: number = 0;
  percentDonacionObligatoria: number = 0;

  fecha = new Date();
  anio = this.fecha.getFullYear();
  dia: any = this.fecha.getDate();
  _mes: any = this.fecha.getMonth();
  mes = this._mes + 1;
  fechaActual: string;
  horaActual = new Date().getHours();
  referencia: string = 'Compra';
  dateSelecte: Date = new Date();
  fechaSeleccionada: string = '';
  shoper: string = 'Si';
  contacto: string = 'WhatsApp';
  pedido: string = 'Agendar';
  horario: string = '9:00am - 12:00pm';
  metodo: string = 'Pago con STRIPE';
  empaque: string = 'Papel';
  comentario: string = '';
  empaqueSeleccionado: any = {};
  _cantidadBolsa: number = 1;
  direccion: string;
  empaques: any[] = [];
  datosDonacion: any[] = [];
  @ViewChild('paypal', { static: false }) paypalElement: ElementRef;
  paypalElementOriginal: ElementRef = null;

  horarioNoSaturday: boolean = false;

  saldo: {
    saldo?: number;
    saldo_disponible?: number;
    saldo_descontado?: number;
    email?: string;
    comprar?: boolean;
    usar?: boolean;
  } = {
    saldo: 0,
    saldo_disponible: 0,
    saldo_descontado: 0,
    email: '',
    comprar: false,
    usar: false,
  };
  idCarritoSus: any;

  constructor(
    private _carritoService: CarritoService,
    private _listasComprasService: ListaComprasService,
    private _productoService: ProductosService,
    private router: Router,
    private route: ActivatedRoute,
    private _usuariosService: UsuariosService,
    private _carritoSuscripcion: CarritoSuscripcionService,
    private _direccionService: DireccionService,
    private _empaqueService: EmpaquesService,
    private _usuarioService: UsuariosService,
    private _ventaService: VentasService,
    private _cuponService: CuponesService,
    private _cuponDescuentoService: CuponesDescuentosService,
    private _suscripcionService: SuscripcionService,
    private _donacionActiva: DonacionService,
    private _mailingService: MailingService,
    private _stripeService: StripeService
  ) {}

  ngOnInit(): void {
    this._donacionActiva.getDonacionActiva().subscribe((res: any) => {
      this.datosDonacion[0] = res.donacion;
    });
    const listas = this._listasComprasService.lista;
    if (!!listas) {
      if (listas.length > 0) this.productos = listas[0].lista;
    } else this.productos = this._carritoService.lista;
    if (this.productos.length > 0) {
      this.getProductosRelacionados();
    }

    // // console.log(this.productos);
    this.calcularTotal();

    if (this.dia < 10) {
      this.dia = '0' + this.fecha.getDate();
    }
    if (this.mes < 10) {
      let mes = this._mes + 1;
      this.mes = '0' + mes;
    }
    this.fechaActual = this.anio + '-' + this.mes + '-' + this.dia;
    this.fechaSeleccionada = this.fechaActual;
    this.datosUsuario.push(
      JSON.parse(localStorage.getItem('usuario_despachate#20211001'))
    );
    this._direccionService
      .getDireccionesxUsuario(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.listaDirecciones = res;
      });
    this._empaqueService.get().subscribe((res: any) => {
      this.empaques = res.empaques;
      this.empaque = this.empaques[0]._id;
      this.empaqueSeleccionado = this.empaques[0];
      this.calcularTotal();
    });
    this._direccionService
      .getDireccionesxUsuario(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.listaDirecciones = res;
        if (this.listaDirecciones.length > 0) {
          this.direccion = this.listaDirecciones[0]._id;
          // this.validarCP();
          this.calcularTotal();
        } else {
          this._usuarioService._toastService.showNotification(
            'top',
            'center',
            'warning',
            'Debes registrar una direccion para entrega antes de realizar tu compra'
          );
          this.router.navigate(['/miCuenta']);
        }
      });
    if (
      this.route.snapshot.params.type &&
      this.route.snapshot.params.type === 'suscripcion'
    ) {
      this.consultarProductos();
    }
    this.tipoEnvio();
    this._ventaService
      .getpedidoXusr(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        // // console.log('pedidos' ,res.pedidos);

        for (const pedido of res.pedidos) {
          this.totalDonado += pedido.donacion;
        }
      });

    this._usuarioService
      .getByEmail(this.datosUsuario[0].email)
      .subscribe((res: any) => {
        // console.log(
        //   '%c USUARIO BY EMAIL',
        //   'color: #4CAF50; font-weight: bold;',
        //   res
        // );

        this.saldo.saldo_disponible = res.usuario.saldo;
        // this.saldo.saldo_disponible = 100;
      });
  }
  mensaje_amigo;
  getItemsCarrito() {
    this.productos = this._carritoService.lista;
    this.calcularTotal();
  }

  getProductosRelacionados() {
    let idSubcat = '';
    if (this.productos[0].producto.subcategoria._id) {
      idSubcat = this.productos[0].producto.subcategoria._id;
    } else {
      idSubcat = this.productos[0].producto.subcategoria;
    }
    this._productoService.getByIdSubcat(idSubcat).subscribe((res: any) => {
      for (let index = 0; index < 7; index++) {
        if (res.productos.length > index) {
          this.productosRelacionados.push(res.productos[index]);
        }
      }
      setTimeout(() => {
        $('#cvendido2').owlCarousel({
          autoplay: true,
          autoplayHoverPause: true,
          items: true,
          rtl: true,
          dots: true,
          loop: true,
          navText: [
            '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
            '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
          ],
          responsive: {
            0: {
              items: 1,
              nav: true,
            },
            600: {
              items: 1,
              nav: false,
            },
            320: {
              items: 1,
              nav: false,
            },
            1000: {
              items: 4,
              nav: true,
              loop: false,
            },
          },
        });
      }, 1000);
    });
  }

  ngAfterViewInit(): void {
    this.paypalElementOriginal = this.paypalElement;

    const self = this;

    paypal
      .Buttons({
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: 'MXN',
                  value: self.total,
                },
              },
            ],
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            self.registrarCompra();
            // alert('Transaction completed by ' + details.payer.name.given_name);
          });
        },
        onError: function (err) {},
      })
      .render(this.paypalElement.nativeElement);
  }
  validarCP() {
    this.costoEnvio = 39;
    for (const direccion of this.listaDirecciones) {
      if (this.direccion === direccion._id) {
        for (const cp of this.cps) {
          if (direccion.codigoPostal == cp) {
            this.costoEnvio = 0;
          }
        }
      }
    }
  }
  calcularTotal() {
    this.total = 0;
    this.subtotal = 0;
    this.cantidadTotal = 0;
    let descuento = 0;
    for (const producto of this.productos) {
      if (this.route.snapshot.params.type) {
        // console.log('producto', producto);
        if (!producto.subtotal) {
          producto.subtotal = producto.cantidad * producto.paquete.precio;
        }
        this.subtotal += producto.subtotal;
        this.total += producto.subtotal;
        this.cantidadTotal += producto.cantidad;
      } else {
        this.subtotal += producto.total;
        this.total += producto.total;
        this.cantidadTotal += producto.cantidad;
      }
    }
    this.subtotal = Math.round((this.subtotal + Number.EPSILON) * 100) / 100;
    this.totalEmpaque = this.empaqueSeleccionado.precio * this._cantidadBolsa;
    this.total += this.totalEmpaque;
    if (this._cupon != null) {
      if (!!this._cupon.tipo && this._cupon.tipo === '%') {
        descuento = this.total * (this._cupon.valor / 100);
      } else if (!!this._cupon.tipo && this._cupon.tipo === '$') {
        descuento = this._cupon.valor;
      } else {
        descuento = this.total * (this._cupon.valor / 100);
      }
    }
    this.total -= descuento;
    let percentOff = this.total * 0.03;
    this.percentDonacionObligatoria =
      Math.round((percentOff + Number.EPSILON) * 100) / 100;

    this.total += this.donacion;

    if (this.total >= 500) {
      this.costoEnvio = 0;
    } else {
      this.costoEnvio = 39;
    }

    // this.validarCP();

    this.total = this.total + this.costoEnvio;

    if (this.saldo.comprar) {
      this.total += this.saldo.saldo;
    }
    if (this.saldo.usar) {
      if (this.total <= this.saldo.saldo_disponible) {
        this.saldo.saldo_descontado = this.total;
        this.total -= this.total;
      } else if (this.total > this.saldo.saldo_disponible) {
        this.total -= this.saldo.saldo_disponible;
        this.saldo.saldo_descontado = this.saldo.saldo_disponible;
      }
      // console.log(this.saldo);
    } else {
      this.saldo.saldo_descontado = 0;
    }

    this.total = Math.round((this.total + Number.EPSILON) * 100) / 100;
  }
  seleccionaEmpaque(id) {
    for (const e of this.empaques) {
      if (e._id == id) {
        this.empaqueSeleccionado = e;
      }
    }
    this.calcularTotal();
  }
  cantidad(index: number, sum: boolean) {
    let producto = this.productos[index];
    // console.log('producto', producto);
    if (sum) {
      producto.cantidad = producto.cantidad + 1;
      if (
        this.route.snapshot.params.type &&
        this.route.snapshot.params.type === 'suscripcion'
      ) {
        producto.subtotal =
          Math.round(
            (producto.subtotal +
              producto.paquete.precio -
              Number(!!producto.oferta ? producto.oferta : '0')) *
              100
          ) / 100;
        this._suscripcionService
          .update(this.productos[index]._id, this.productos[index])
          .subscribe((res: any) => {
            this._productoService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Se modifico la cantidad del producto'
            );
          });
      } else {
        producto.total =
          Math.round(
            (producto.total +
              (producto.paquete.precio -
                Number(!!producto.oferta ? producto.oferta : '0'))) *
              100
          ) / 100;
        this._carritoService.guardarCarrito(this.productos);
      }

      this.calcularTotal();
    } else {
      if (producto.cantidad > 1) {
        if (
          this.route.snapshot.params.type &&
          this.route.snapshot.params.type === 'suscripcion'
        ) {
          producto.subtotal =
            Math.round((producto.subtotal - producto.paquete.precio) * 100) /
            100;
          this._suscripcionService
            .update(this.productos[index]._id, this.productos[index])
            .subscribe((res: any) => {
              this._productoService._toastService.showNotification(
                'top',
                'center',
                'success',
                'Se modifico la cantidad del producto'
              );
            });
        } else {
          producto.total =
            Math.round((producto.total - producto.paquete.precio) * 100) / 100;
          this._carritoService.guardarCarrito(this.productos);
        }
        producto.cantidad = producto.cantidad - 1;

        this.calcularTotal();
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
    this.calcularTotal();
  }
  continuarCompra() {
    this._carritoService.guardarCarrito(this.productos);
    this.router.navigate(['/datosEntrega']);
  }
  eliminarProducto(id, pqtId) {
    if (this.route.snapshot.params.type) {
      let idx = this.productos.findIndex((reg) => reg.paquete._id == id);
      this.productos.splice(idx, 1);
      if (!!this.idCarritoSus) {
        this._suscripcionService
          .deleteProducto(this.idCarritoSus, id)
          .subscribe((res: any) => {});
      }
      // console.log('idx', idx);
    } else {
      this._carritoService.eliminarItem(id);
      this.productos = this._carritoService.lista;
    }

    this.calcularTotal();
  }
  tipoEnvio() {
    if (this.pedido == 'Agendar' && this.horaActual >= 15) {
      let dia: Number = this.dia + 1;
      // // console.log(dia);
      this.fechaActual = this.anio + '-' + this.mes + '-' + dia;

      this.campoFecha = false;
    } else if (this.pedido == 'Agendar' && this.horaActual <= 15) {
      this.campoFecha = false;
    } else if (this.pedido == 'Express' && this.horaActual < 15) {
      this.campoFecha = true;
    } else if (this.pedido == 'Express' && this.horaActual >= 16) {
      this.campoFecha = true;
      // let dia: Number = this.dia + 1;

      // this.fechaActual = this.anio + '-' + this.mes + '-' + dia;
      // this.fechaSeleccionada = `${this.fechaActual}`;
    } else {
      this.campoFecha = false;
    }
    // this.ValidateDate();
  }
  async registrarCompra(stripe: boolean = false) {
    if (this.total < 50) {
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'danger',
        'El mínimo de la conmpra es de $50 pesos'
      );
      return;
    }

    // if (this.saldo.usar && this.metodo === 'Pago con STRIPE') {
    //   this._productoService._toastService.showNotification(
    //     'top',
    //     'center',
    //     'warning',
    //     'No se puede usar saldo en una compra con STRIPE'
    //   );
    //   return;
    // }
    this.blockUI.start();
    // this.validarCP();
    if (this.referencia != 'Suscripción') {
      this.referencia = this.pedido;
    }
    let compra: any = {
      fechaCompra: new Date(),
      fechaRecepcion: this.fechaSeleccionada,
      horarioRecepcion: this.horario,
      precioTotal: this.total,
      cantidadTotal: this.cantidadTotal,
      metodoPago:
        this.saldo.usar && this.total == 0
          ? 'PAGADO CON SALDO'
          : this.saldo.usar && this.total > 0
          ? `PAGADO CON SALDO Y ${this.metodo}`
          : this.metodo,
      referenciaPago: this.referencia,
      contacto: true,
      formaContacto: this.contacto,
      estatusPago: 'Pendiente',
      estatusEnvio: 'Pendiente',
      direccion: this.direccion,
      usuario: this._usuarioService.usuario._id,
      empaque: this.empaque,
      cantidadEmpaque: this._cantidadBolsa,
      cupon: this._cupon,
      donacion: this.donacion,
      comentario: this.comentario,
      saldo_comprado: this.saldo.saldo,
      correo_saldo: this.saldo.email,
      saldo_usado: this.saldo.saldo_descontado,
      saldo_descontado: this.saldo.usar,
      saldo_agregado:
        this.saldo.comprar && this.metodo === 'Pago con PAYPAL' ? true : false,
      RFC: this.RFC,
    };
    if (!!compra.saldo_comprado && compra.saldo_comprado != '') {
      if (Number(`${compra.saldo_comprado}`) < 50) {
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'danger',
          'El mínimo de saldo que puedes comprar es de $50 pesos'
        );
        return;
      }
    }
    // console.log(compra);
    this._ventaService.insert(compra).subscribe(
      (res: any) => {
        let productos: any[] = [];
        let cupones: any[] = this.productos
          .filter((p: any) => !!p.cupon)
          .map((p: any) => ({
            cupon: p.cupon,
            usuario: this._usuarioService.usuario._id,
            pedido: res.pedido._id,
          }));
        if (this._cupon) {
          cupones = [
            ...cupones,
            {
              cupon: this._cupon._id,
              usuario: this._usuarioService.usuario._id,
              pedido: res.pedido._id,
            },
          ];
        }

        if (this._cupon != null) {
          this._cuponService
            .cuponUsado({
              cupon: this._cupon._id,
              usuario: this._usuarioService.usuario._id,
            })
            .subscribe((res: any) => {});
        }
        this.productos.forEach((element) => {
          if (this.route.snapshot.params.type) {
            productos.push({
              cantidad: element.cantidad,
              subtotal: element.subtotal,
              pedido: res.pedido._id,
              producto: element.producto,
              oferta: !!element.oferta ? element.oferta : 0,
              paquete: element.paquete,
            });
          } else {
            productos.push({
              cantidad: element.cantidad,
              subtotal: element.total,
              pedido: res.pedido._id,
              producto: element.producto,
              oferta: !!element.oferta ? element.oferta : 0,
              paquete: element.paquete,
            });
          }
        });
        this._ventaService.insertDetalles({ detalles: productos }).subscribe(
          async (res2: any) => {
            if (
              this.metodo == 'Pago con STRIPE' ||
              this.metodo == 'Pago con PAYPAL'
            ) {
              this._productoService._toastService.showNotification(
                'top',
                'center',
                'warning',
                'Para completar tu compra continua con tu pago'
              );
            }

            let direccionO: any;
            for (const direccion of this.listaDirecciones) {
              if (this.direccion === direccion._id) {
                direccionO = direccion;
              }
            }

            if (!stripe) {
              this.blockUI.stop();
              this._carritoService.limpiarCarrito();
              this.productos = [];

              try {
                await this._mailingService
                  .correoCompraUsuario(
                    this._usuarioService.usuario.email,
                    res.pedido,
                    productos,
                    direccionO,
                    this.totalDonado
                  )
                  .toPromise();
                await this._mailingService
                  .correoVentaAdmin(
                    this._usuarioService.usuario.email,
                    res.pedido,
                    productos,
                    direccionO,
                    this.totalDonado,
                    this._usuarioService.usuario,
                    this.empaqueSeleccionado
                  )
                  .toPromise();
                /* CORREOS DE COMPRA SALDO */
                if (!!compra.saldo_comprado) {
                  await this._mailingService
                    .regalarSaldoAmigo(
                      !!compra.correo_saldo
                        ? compra.correo_saldo
                        : this._usuarioService.usuario.email,
                      compra.saldo_comprado,
                      !!compra.correo_saldo
                        ? compra.correo_saldo
                        : this._usuarioService.usuario.email,
                      !!this.mensaje_amigo ? this.mensaje_amigo : ''
                    )
                    .toPromise();
                  await this._mailingService
                    .regalarSaldoAmigoAdmin(
                      this._usuarioService.usuario.email,
                      compra.saldo_comprado,
                      !!compra.correo_saldo
                        ? compra.correo_saldo
                        : this._usuarioService.usuario.email
                    )
                    .toPromise();
                }

                if (!!compra.saldo_usado && `${compra.saldo_usado}` != '0') {
                  await this._mailingService
                    .usoSaldoAmigoAdmin(
                      this._usuarioService.usuario.email,
                      compra.saldo_usado
                    )
                    .toPromise();
                }
                /* CORREOS DE COMPRA SALDO */
              } catch (err) {}
              this.router.navigate(['/compraExitosa']);
              return;
            }

            const Stripe = await loadStripe(environment.stripe_pk);
            this._stripeService
              .createSession(productos, {
                ...res.pedido,
                costoEnvio: this.costoEnvio,
                empaque: this.empaqueSeleccionado,
              })
              .subscribe(async (res: any) => {
                if (!!res.session) {
                  await this._carritoService.limpiarCarrito();
                  this.productos = [];
                  this.blockUI.stop();
                  Stripe.redirectToCheckout({
                    sessionId: res.session.id,
                  });
                }
              });
          },
          (
              err: any // console.log(err),
            ) =>
            () => {}
        );
        this._ventaService.insertHistorialCupones(cupones).subscribe(
          (res: any) => {},
          (err: any) => {},
          () => {}
        );
      },
      (
          err: any // console.log(err),
        ) =>
        () => {}
    );
  }
  cupon(codigo) {
    this._cuponService
      .getXIdUsuario(this._usuarioService.usuario._id)
      .subscribe((res2: any) => {
        let listaCupones: any[] = [];
        listaCupones = res2.cupones;
        for (let index = 0; index < listaCupones.length; index++) {
          if (
            listaCupones[index].tipoCupon == 'Usuario' &&
            listaCupones[index].codigo == codigo
          ) {
            this._productoService._toastService.showNotification(
              'top',
              'center',
              'warning',
              'No puedes utilizar el código que se te asigno'
            );
            return;
          }
        }
        this._cuponService.getByCodigo(this._codigo).subscribe((res: any) => {
          if (res.cupon != null) {
            this._cupon = res.cupon;
            this._cuponService
              .getCuponUsado(this._usuarioService.usuario._id, this._cupon._id)
              .subscribe((res: any) => {
                this.calcularTotal();
                if (res.cuponUsuario) {
                  this._productoService._toastService.showNotification(
                    'top',
                    'center',
                    'warning',
                    'El codigo ingresado ya ha sido usado'
                  );
                  this._cupon = null;
                  this.calcularTotal();
                } else {
                  this.calcularTotal();
                }
              });
          } else {
            this._cupon = null;
            // this._productoService._toastService.showNotification(
            //   'top',
            //   'center',
            //   'warning',
            //   'El codigo ingresado no es un cupon valido'
            // );
            // this.calcularTotal();
            this._cuponDescuentoService.get({ codigo: this._codigo }).subscribe(
              (res: any) => {
                // console.log('%c Cupon Service', 'color:green', res);
                if (res.cupones.length > 0) {
                  let cupon = res.cupones[0];
                  if (cupon.caduca == true) {
                    // console.log('%c cupon caduca', 'color: orange');
                    if (cupon.tipoCaducidad == 'fecha') {
                      // console.log('%c caducidad fecha', 'color: orange');
                      let now = new Date();
                      let fechaCaducidad = new Date(cupon.fechaCaducidad);
                      let fechaInicio = new Date(cupon.fechaInicio);
                      if (
                        fechaInicio.getTime() > now.getTime() ||
                        now.getTime() > new Date(cupon.fechaCaducidad).getTime()
                      ) {
                        // console.log(
                        //   '%c cupon no vigente',
                        //   'color: orange',
                        //   fechaInicio.getTime(),
                        //   now.getTime(),
                        //   fechaInicio.getTime() > now.getTime(),
                        //   fechaCaducidad.getTime(),
                        //   now.getTime(),
                        //   now.getTime() >
                        //     new Date(cupon.fechaCaducidad).getTime()
                        // );
                        this._carritoService._toastService.showNotification(
                          'top',
                          'center',
                          'warning',
                          'El cupon no esta vigente'
                        );
                        return;
                      }
                    } else {
                      // console.log('%c caducidad intentos', 'color: orange');
                      if (cupon.intentos >= cupon.intentosMaximos) {
                        // console.log('%c cupon no vigente', 'color: orange');
                        return;
                      }
                    }
                  }
                  if (cupon.compraMinima == true) {
                    if (this.total < cupon.compraMinima) {
                      this._carritoService._toastService.showNotification(
                        'top',
                        'center',
                        'warning',
                        'El monto minimo para usar el cupon es de ' +
                          cupon.compraMinima
                      );
                      return;
                    }
                  }

                  this._cupon = cupon;
                  this.calcularTotal();
                }
              },
              (err: any) => {
                this._productoService._toastService.showNotification(
                  'top',
                  'center',
                  'warning',
                  'El codigo ingresado no es un cupon valido'
                );
                this.calcularTotal();
              }
            );
          }

          // // console.log(res);
        });
      });
  }
  convertirASuscripcion() {
    let usuario = this._usuariosService.usuario;
    this._carritoSuscripcion
      .UsuarioSuscripcion(usuario._id)
      .subscribe((res1: any) => {
        if (res1.existe) {
          for (let index = 0; index < this.productos.length; index++) {
            let datosProducto = {
              cantidad: this.productos[index].cantidad,
              carritoSuscripcion: res1.carrito._id,
              paquete: this.productos[index].paquete._id,
              producto: this.productos[index].producto._id,
              subtotal: this.productos[index].total,
            };
            this._suscripcionService
              .insert(datosProducto)
              .subscribe((res: any) => {});
          }
          this._productoService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Productos agregados a tu suscripción Correctamente'
          );
          this.router.navigate(['/miSuscripcion']);
        } else {
          this._productoService._toastService.showNotification(
            'top',
            'center',
            'warning',
            'Registra tus datos para poder agregar los productos del carrito a tu suscripción'
          );
          this.router.navigate(['/miSuscripcion']);
        }
      });
  }

  consultarProductos() {
    this._carritoSuscripcion
      .UsuarioSuscripcion(this._usuarioService.usuario._id)
      .subscribe((res: any) => {
        this.idCarritoSus = res.carrito._id;
        this.referencia = 'Suscripción';
        this.metodo = res.carrito.metodoPago;
        this.shoper = res.carrito.contacto ? 'Si' : 'No';
        this.contacto =
          res.carrito.formaContacto === 'Whatsapp' ? 'WhatsApp' : 'Teléfono';
        this.seleccionaEmpaque(res.carrito.empaque._id);
        this.empaque = res.carrito.empaque
          ? res.carrito.empaque._id
          : this.empaque;
        this.seleccionaEmpaque(this.empaque);
        this._cantidadBolsa = res.carrito.cantidadEmpaques;

        this.direccion = res.carrito.direccion._id;
        if (res.existe) {
          this._suscripcionService
            .getXIdCarSus(res.carrito._id)
            .subscribe((products: any) => {
              this.productos = products.detalleSuscripcion;
              // // console.log(this.productos);
              if (this.productos.length > 0) {
                let idSubcat = '';

                idSubcat = this.productos[0].producto.subcategoria;

                this.getProductosRelacionados();
              }
              this.calcularTotal();
            });
        }
      });
  }

  onDateChange(objDate: any) {
    // console.log(objDate);

    this.fechaSeleccionada = this.getDate(objDate);
    this.dateSelecte = objDate;
    // console.log(this.fechaSeleccionada);
    this.ValidateDate();
  }
  ValidateDate() {
    const currentDate = Intl.DateTimeFormat('es-MX', {
      hour12: false,
      hour: '2-digit',
      weekday: 'short',
    }).formatToParts(new Date());

    const selectedDate = Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      weekday: 'short',
    }).formatToParts(this.dateSelecte);

    const currentWeekDay = currentDate.find((part) => part.type === 'weekday');
    const currentHour = currentDate.find((part) => part.type === 'hour');
    const selectedWeekDay = selectedDate.find(
      (part) => part.type === 'weekday'
    );

    console.log({ currentHour, currentWeekDay, selectedWeekDay });

    if (selectedWeekDay.value === 'sáb') {
      console.log('Sabado');
      this.horarioNoSaturday = true;
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Recuerda que los sabados no se cuenta con servicio de entrega despues de las 12'
      );
      if (
        currentWeekDay.value === 'sáb' &&
        Number(currentHour.value) >= 9 &&
        Number(currentHour.value) < 12
      ) {
        console.log('Mayor a 9 sab');
        this.horario = '12:00pm - 4:00pm';
      }
      if (currentWeekDay.value === 'sáb' && Number(currentHour.value) >= 12) {
        console.log('Mayor a 12 sab');
        this._productoService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Los sabados no se cuenta con servicio de entrega despues de las 12'
        );
        this.onDateChange(this.addDaysToDate(this.dateSelecte, 2));
      }
      return;
    }

    if (selectedWeekDay.value === 'dom') {
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Los domingos no se cuenta con servicio de entrega'
      );
      this.onDateChange(this.addDaysToDate(this.dateSelecte, 1));
      return;
    }

    this.horarioNoSaturday = false;

    if (currentWeekDay.value === selectedWeekDay.value) {
      console.log('Mismo dia');
      if (Number(currentHour.value) >= 9 && Number(currentHour.value) < 12) {
        console.log('Mayor a 9');
        this.horario = '12:00pm - 4:00pm';
      } else if (
        Number(currentHour.value) >= 12 &&
        Number(currentHour.value) < 16
      ) {
        console.log('Mayor a 12');
        this.horario = '4:00pm - 7:00pm';
      } else if (Number(currentHour.value) >= 16) {
        console.log('Mayor a 16');
        this.horario = '9:00am - 12:00pm';
        this.dateSelecte = this.addDaysToDate(this.dateSelecte, 1);
        // this.onDateChange(this.addDaysToDate(this.dateSelecte, 1));
      }
    }
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

  addDaysToDate(date: Date, days: number) {
    return new Date(date.setDate(date.getDate() + days));
  }
}
