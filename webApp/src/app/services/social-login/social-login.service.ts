import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Router } from '@angular/router';
import { MailingService } from '../mailing/mailing.service';
import { ToastService } from '../toast/toast.service';
import { CuponesService } from '../cupones/cupones.service';
import { CarritoService } from '../carrito/carrito.service';
@Injectable({
  providedIn: 'root',
})
export class SocialLoginService {
  public usuario: any = {};
  constructor(
    public auth: AngularFireAuth,
    private _usuarioService: UsuariosService,
    private router: Router,
    /* SERVICIOS EN CASO DE REGISTRO AUTOMATICO */
    private _mailingService: MailingService,
    private _toastService: ToastService,
    private _cuponService: CuponesService,
    private _carritoService: CarritoService /* SERVICIOS EN CASO DE REGISTRO AUTOMATICO */
  ) {
    this.auth.authState.subscribe((user) => {
      console.log('Estado del usuario: ', user);
      if (!user) return;
      this.usuario.nombre = user.displayName;
      this.usuario.email = user.email;
      this.usuario.uid = user.uid;
      this.usuario.telefono = user.phoneNumber;
      this.usuario.provider_id = user.providerData[0].providerId;
      this.usuario.password = user.providerData[0].providerId;
      this.usuario.terminos = true;
      console.log('usuario', this.usuario);
      if (!this._usuarioService.estaLogueado()) {
        // this.logout();
        // this.router.navigate(['/registrarse']);
        this.registroUsuario();
      } else {
        this.logout();
      }
    });
  }
  registroUsuario() {
    this._usuarioService
      .Login(
        {
          email: this.usuario.email,
          password: this.usuario.password,
          tipo_login: 'Google',
        },
        false
      )
      .subscribe(
        (data: any) => {
          this._carritoService.guardarCarrito().then(() => {
            this._carritoService.getItemsCarrito();
            this.router.navigate(['/miCuenta']);
          });
        },
        (error) => {
          this._usuarioService.insert(this.usuario, false).subscribe(
            (res: any) => {
              let codigo = new Date().getTime();
              if (res.ok) {
                this._mailingService
                  .correoRegistroUsuario(res.usuario.email)
                  .subscribe((res: any) => {});
                let datosCupon = {
                  codigo: codigo,
                  valor: '5',
                  tipoCupon: 'Usuario',
                  idUsuario: res.usuario._id,
                };
                this._cuponService
                  .insert(datosCupon)
                  .subscribe((res2: any) => {});
                this._toastService.showNotification(
                  'top',
                  'center',
                  'success',
                  'Tus datos se han registrado correctamente'
                );
                this._usuarioService
                  .Login(
                    {
                      email: this.usuario.email,
                      password: this.usuario.password,
                      tipo_login: 'Google',
                    },
                    false
                  )
                  .subscribe((data: any) => {
                    this._carritoService.guardarCarrito().then(() => {
                      this._carritoService.getItemsCarrito();
                      this.router.navigate(['/miCuenta']);
                    });
                  });
                this.logout();
              } else {
                this._usuarioService
                  .Login(
                    {
                      email: this.usuario.email,
                      password: this.usuario.password,
                      tipo_login: 'Google',
                    },
                    false
                  )
                  .subscribe((data: any) => {
                    this._carritoService.guardarCarrito().then(() => {
                      this._carritoService.getItemsCarrito();
                      this.router.navigate(['/miCuenta']);
                    });
                  });
              }
            },
            (error) => {
              console.log('erorr', error);
              this.logout();
              this._toastService.showNotification(
                'top',
                'center',
                'danger',
                'Este email ya pertenece a una cuanta registrada'
              );
            }
          );
        }
      );
  }
  login(proveedor: string) {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout() {
    console.log('log');
    this.auth.signOut();
  }
}
