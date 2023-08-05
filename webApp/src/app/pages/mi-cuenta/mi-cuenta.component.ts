import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast/toast.service';
import { Router } from '@angular/router';
import { DireccionService } from '../../services/direcciones/direccion.service';
import { CarritoSuscripcionService } from '../../services/carrito-suscripcion/carrito-suscripcion.service';
import { FavoritosService } from '../../services/favoritos/favoritos.service';
import { URL_IMGS, environment } from 'src/environments/environment';
import { CuponesService } from '../../services/cupones/cupones.service';
import Swal from 'sweetalert2';
import { VentasService } from '../../services/ventas/ventas.service';
import { DetalleVentasService } from '../../services/detalleVentas/detalle-ventas.service';
import { MailingService } from '../../services/mailing/mailing.service';
import { SubirArchivosService } from '../../services/subir-archivos/subir-archivos.service';
import { RecetasFavoritosService } from 'src/app/services/recetas favoritos/recetas-favoritos.service';
import { StripeService } from '../../services/stripe/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
declare var $;


const KEY_USER_LOCAL = 'usuario_despachate#20211001';
@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.component.html',
  styleUrls: ['./mi-cuenta.component.css'],

})

export class MiCuentaComponent implements OnInit {
  public imagenSubir: File;
  public imagenTemp: any = null;
  public archivos: any[] = [];
  public archivosSubir: any[] = [];
  public imgEditar = '';
  public urlUser = `${URL_IMGS}usuarios/`;

  private dom: Document;
  public datosUsuario: any[] = [];
  listaDirecciones: any[] = [];
  pedidos: any[] = [];
  detalles: any[] = [];
  listaCuponesGenerales: any[] = [];
  cuponUsuario: string;
  contactar: string = 'si';
  contacto: string = 'Whatsapp';
  prodFav: any[] = [];
  recetasFav: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  url_receta: string = `${URL_IMGS}recetas/`;
  numTelefono: string;
  correos: String = '';
  totalDonado: number = 0;

  constructor(
    public _usuarioService: UsuariosService,
    private _toastService: ToastService,
    private router: Router,
    private _direccionService: DireccionService,
    private _carritoSuscripcion: CarritoSuscripcionService,
    private _favoritoService: FavoritosService,
    private _cuponService: CuponesService,
    private _ventaService: VentasService,
    private _detalleVentasService: DetalleVentasService,
    private _mailingService: MailingService,
    private _subirArchivoService: SubirArchivosService,
    private _recetasFavoritosService: RecetasFavoritosService,
    private _stripeService: StripeService
  ) { }
  form: FormGroup;
  async ngOnInit(): Promise<void> {
    this.form = new FormGroup({
      password: new FormControl(null, Validators.required),
      confirmarPassword: new FormControl(null, Validators.required),
    });

    const user_local = JSON.parse(localStorage.getItem(KEY_USER_LOCAL));

    const { usuario } = await this._usuarioService.getByEmail(user_local?.email).toPromise();

    const { saldoDisponible, saldoEnCuenta, saldoPendienteDescontar } = await this._usuarioService.getSaldo(usuario._id).toPromise();


    this.datosUsuario.push(
      { ...usuario, saldo: saldoDisponible, saldoEnCuenta, saldoPendienteDescontar }
    );
    this.imgEditar = this._usuarioService.usuario.img
      ? this._usuarioService.usuario.img
      : 'no-image';

    this._carritoSuscripcion
      .UsuarioSuscripcion(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.contacto = res.carrito ? res.carrito.formaContacto : this.contacto;
        if (res.carrito) {
          this.contactar = res.carrito.contacto ? 'si' : 'no';
        }
      });
    this.obtenerDirecciones();
    this._favoritoService
      .get3ProdFav(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.prodFav = res.favoritos;
      });
    this._cuponService
      .getXIdUsuario(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        console.log('cupones', res);
        let listaCupones: any[] = [];
        listaCupones = res.cupones;
        for (let index = 0; index < listaCupones.length; index++) {
          if (listaCupones[index].tipoCupon == 'General') {
            this.listaCuponesGenerales.push(listaCupones[index]);
          } else {
            this.cuponUsuario = listaCupones[index].codigo;
          }
        }
      });
    this.obtenerVentas();
    this.getRecetasFavoritas();
  }

  getRecetasFavoritas() {
    this._recetasFavoritosService
      .getFavoritos(this._usuarioService.usuario._id, { limit: 5 })
      .subscribe((res: any) => {
        this.recetasFav = res.recetas_favorito;
      });
  }

  obtenerDirecciones() {
    this._direccionService
      .getDireccionesxUsuario(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.listaDirecciones = res;
      });
  }

  seleccionImage(archivo: File) {
    const reader = new FileReader();
    const urlImagenTemp = reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      this.imagenTemp = reader.result;
      this.archivos = [reader.result];
      this.archivosSubir = [archivo];
      this._subirArchivoService
        .subirArchivo(
          this.archivosSubir,
          'usuarios',
          this._usuarioService.usuario._id
        )
        .then((res: any) => {
          // this.consultarDatos();
          console.log(res);
          if (res.usuario) {
            this._usuarioService.usuario = res.usuario;
            // this._toastService.showNotification('top','center','success','Se subio correctamente la imagen');
            this._usuarioService.guardarStorage(
              this._usuarioService.usuario._id,
              this._usuarioService.token,
              this._usuarioService.usuario
            );
            this.imgEditar = this._usuarioService.usuario.img;
          }
        });
    };
  }

  eliminarDireccion(idDireccion) {
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
          this._direccionService.delete(idDireccion).subscribe((res: any) => {
            this.obtenerDirecciones();
            this._toastService.showNotification(
              'top',
              'center',
              'success',
              'Dirección eliminada correctamente'
            );
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
  cambiarPassword() {
    if (
      this.form.get('password').value !=
      this.form.get('confirmarPassword').value
    ) {
      this._toastService.showNotification(
        'top',
        'center',
        'danger',
        'Las contraseñas que ingresaste no coinciden'
      );
    } else {
      this._usuarioService
        .cambiarPassword(this.datosUsuario[0]._id, this.form.value)
        .subscribe((res: any) => {
          this._toastService.showNotification(
            'top',
            'center',
            'success',
            'Tu contraseña ha sido actualizada correctamente'
          );
          $('#mdlPassword').modal('hide');
        });
    }
  }
  cerrarSesion() {
    this._usuarioService.logout();
  }

  obtenerVentas() {
    console.log('entro');
    this._ventaService
      .getpedidoXusr(this._usuarioService.usuario._id)
      .subscribe((res: any) => {
        this.pedidos = res.pedidos;
        console.log('pedidos', this.pedidos);
        this.totalDonado = 0;
        for (const pedido of this.pedidos) {
          this.totalDonado +=
            Math.round((pedido.precioTotal * 0.03 + Number.EPSILON) * 100) /
            100;
          this.totalDonado += pedido.donacion;
        }
      });
  }

  mostrarPedido(index: number) {
    console.log(this.pedidos[index]._id);

    const pedido = this.pedidos[index];


    
    this._detalleVentasService
    .getXIdVenta(pedido._id)
    .subscribe((res: any) => {
        this.detalles = res.detalleCarrito;
        if(pedido.saldo_comprado > 0){
          this.detalles.push({
            producto: {
              nombre: 'Saldo de Gift Card',
            },
            paquete: {
              paquete: `Saldo de Gift Card $${pedido.saldo_comprado}`,
            },
            cantidad: 1,
            subtotal: pedido.saldo_comprado,
            oferta: 0,
          })  
        }
        console.log(res);
      });
    $('#modelId').modal('show');
  }

  enviarCorreos() {
    let arr = this.correos ? this.correos.split(',') : [];
    console.log(this.correos);
    if (arr.length > 0) {
      this._mailingService
        .enviarCupon(arr, this.cuponUsuario)
        .subscribe((res: any) => {
          this._toastService.showNotification(
            'top',
            'center',
            'success',
            'Código enviado correctamente'
          );
        });
    } else {
      this._toastService.showNotification(
        'top',
        'center',
        'warning',
        'No ha introducido ningun email'
      );
    }
  }
  copyLink(text: string) {
    const event = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', text);
      e.preventDefault();
    };
    document.addEventListener('copy', event);
    document.execCommand('copy');
    this._toastService.showNotification(
      'top',
      'center',
      'success',
      'Código copiado correctamente'
    );
  }

  async pagarPedido(pedido: any) {
    const Stripe = await loadStripe(environment.stripe_pk);
    this._stripeService.retriveSession(pedido._id).subscribe((res: any) => {
      Stripe.redirectToCheckout({
        sessionId: res.session.id,
      }).then((result) => {
        console.log(result);
      });
    });
  }
}
