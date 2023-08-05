import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { ProductosService } from 'src/app/services/productos/productos.service';
import { URL_IMGS } from 'src/environments/environment';
import { cps } from '../../config/config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { VentasService } from '../../services/ventas/ventas.service';
import { CuponesService } from '../../services/cupones/cupones.service';
import { MailingService } from '../../services/mailing/mailing.service';
import { StripeService } from '../../services/stripe/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { EmpaquesService } from '../../services/empaques/empaques.service';
import { DireccionService } from '../../services/direcciones/direccion.service';
declare var $;
declare var paypal;
@Component({
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.css'],
})
export class GiftCardComponent implements OnInit {
  productos: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  subtotal: number = 0;

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
    comprar: true,
    usar: false,
  };

  mensaje_amigo;
  @ViewChild('paypal', { static: false }) paypalElement: ElementRef;
  paypalElementOriginal: ElementRef = null;
  @BlockUI() blockUI: NgBlockUI;
  referencia: string = 'Compra';

  contacto: string = 'WhatsApp';
  pedido: string = 'Agendar';
  horario: string = '9:00am - 12:00pm';
  metodo: string = 'Pago con STRIPE';
  RFC: string = null;
  _cupon: any = null;
  direccion = null;
  listaDirecciones: any[] = [];
  totalDonado = 0;
  empaqueSeleccionado: any = {};
  empaques: any[] = [];
  costoEnvio = 0;
  empaque: string = 'Papel';
  percentDonacionObligatoria: number = 0;
  donacion: number = 0;
  cantidadTotal = 0;
  totalEmpaque: number = 0;
  _cantidadBolsa: number = 0;

  fecha = new Date();
  anio = this.fecha.getFullYear();
  dia: any = this.fecha.getDate();
  _mes: any = this.fecha.getMonth();
  mes = this._mes + 1;
  fechaActual: string;
  horaActual = new Date().getHours();
  fechaSeleccionada: string = '';
  constructor(
    private _carritoService: CarritoService,
    private _productoService: ProductosService,
    private router: Router,
    private route: ActivatedRoute,
    private _usuarioService: UsuariosService,
    private _ventaService: VentasService,
    private _cuponService: CuponesService,
    private _mailingService: MailingService,
    private _stripeService: StripeService,
    private _empaqueService: EmpaquesService,
    private _direccionService: DireccionService
  ) {}
  total;
  tamanio_pantalla
  public datosUsuario: any[] = [];
  ngOnInit(): void {
    if (screen.width < 740) this.tamanio_pantalla = 'Small';
    else if (screen.width < 1280) this.tamanio_pantalla = 'Mediana';
    else this.tamanio_pantalla = 'Grande';
    // this.productos = this._carritoService.lista;
    this.productos = [];
    this.calcularSubtotal();
    console.log(this.productos);
    if (this.dia < 10) {
      this.dia = '0' + this.fecha.getDate();
    }
    if (this.mes < 10) {
      let mes = this._mes + 1;
      this.mes = '0' + mes;
    }
    this.fechaActual = this.anio + '-' + this.mes + '-' + this.dia;
    this.fechaSeleccionada = this.fechaActual;
    this._empaqueService.get().subscribe((res: any) => {
      this.empaques = res.empaques;
      this.empaque = this.empaques[0]._id;
      this.empaqueSeleccionado = this.empaques[0];
      this.calcularTotal();
    });
    this.datosUsuario.push(
      JSON.parse(localStorage.getItem('usuario_despachate#20211001'))
    );
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
  calcularTotal() {
    this.total = 0;
    this.subtotal = 0;
    this.cantidadTotal = 0;
    let descuento = 0;
    for (const producto of this.productos) {
      if (this.route.snapshot.params.type) {
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
      this.costoEnvio = 0;
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
      console.log(this.saldo);
    } else {
      this.saldo.saldo_descontado = 0;
    }

    this.total = Math.round((this.total + Number.EPSILON) * 100) / 100;
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
      cantidadTotal: 1,
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
      comentario: this.mensaje_amigo,
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
    console.log(compra);
    // return;
    this._ventaService.insert(compra).subscribe(
      async (res: any) => {
        let productos: any[] = [];
        /* let cupones: any[] = this.productos
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
        } */

        /* if (this._cupon != null) {
          this._cuponService
            .cuponUsado({
              cupon: this._cupon._id,
              usuario: this._usuarioService.usuario._id,
            })
            .subscribe((res: any) => {});
        } */
        /* this.productos.forEach((element) => {
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
        }); */
        /* this._ventaService.insertDetalles({ detalles: productos }).subscribe(
          async (res2: any) => { */
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
          // this._carritoService.limpiarCarrito();
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
            if (!!compra.correo_saldo && !!compra.saldo_comprado) {
              await this._mailingService
                .regalarSaldoAmigo(
                  compra.correo_saldo,
                  compra.saldo_comprado,
                  compra.correo_saldo,
                  !!this.mensaje_amigo ? this.mensaje_amigo : ''
                )
                .toPromise();
              await this._mailingService
                .regalarSaldoAmigoAdmin(
                  this._usuarioService.usuario.email,
                  compra.saldo_comprado,
                  compra.correo_saldo
                )
                .toPromise();
            }
          } catch (err) {}
          this.router.navigate(['/compraExitosa']);
          return;
        }

        const Stripe = await loadStripe(environment.stripe_pk);
        this._stripeService
          .createSessionGiftCard({
            ...res.pedido,
            costoEnvio: this.costoEnvio,
            empaque: this.empaqueSeleccionado,
          })
          .subscribe(async (res: any) => {
            if (!!res.session) {
              // await this._carritoService.limpiarCarrito();
              this.productos = [];
              this.blockUI.stop();
              Stripe.redirectToCheckout({
                sessionId: res.session.id,
              });
            }
          });
        /* },
          (err: any) => console.log(err),
          () => {}
        ); */
        /* this._ventaService.insertHistorialCupones(cupones).subscribe(
          (res: any) => {},
          (err: any) => {},
          () => {}
        ); */
      },
      (err: any) => console.log(err),
      () => {}
    );
  }
}
