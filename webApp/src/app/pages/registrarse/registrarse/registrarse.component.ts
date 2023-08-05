import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { ToastService } from '../../../services/toast/toast.service';
import { MailingService } from '../../../services/mailing/mailing.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CuponesService } from '../../../services/cupones/cupones.service';
import Swal from 'sweetalert2';
import { DireccionService } from '../../../services/direcciones/direccion.service';
import { SocialLoginService } from '../../../services/social-login/social-login.service';
@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.css'],
})
export class RegistrarseComponent implements OnInit {
  form: FormGroup;
  constructor(
    private _usuarioService: UsuariosService,
    private _toastService: ToastService,
    private _mailingService: MailingService,
    private _cuponService: CuponesService,
    private _direccionService: DireccionService,
    private router: Router,
    public _socialLoginService: SocialLoginService
  ) {}

  ngOnInit(): void {
    if (this._usuarioService.estaLogueado()) {
      this.router.navigate(['/miCuenta']);
    }

    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      telefono: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      confirmarPassword: new FormControl(null, Validators.required),
      mailing: new FormControl(null),
      terminos: new FormControl(null, Validators.required),
      //estos son los campos para la direccion
      codigoPostal: new FormControl(null, Validators.required),
      colonia: new FormControl(null, Validators.required),
      numeroInterior: new FormControl(null),
      referencia: new FormControl(null, Validators.required),
      calle: new FormControl(null, Validators.required),
    });
    setTimeout(() => {
      this.check_social_login();
    }, 200);
  }
  check_social_login() {
    if (!!this._socialLoginService.usuario.nombre) {
      this.form.get('nombre').setValue(this._socialLoginService.usuario.nombre);
      this.form.get('email').setValue(this._socialLoginService.usuario.email);
      this.form
        .get('telefono')
        .setValue(this._socialLoginService.usuario.telefono);
    }
  }
  registrarse() {
    if (this.form.valid) {
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
      } else if (this.form.controls.email.value.includes('yahoo')) {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Correo no valido'
        );
      } else {
        let user_temp: any = {
          nombre: this.form.controls.nombre.value,
          telefono: this.form.controls.telefono.value,
          email: this.form.controls.email.value,
          password: this.form.controls.password.value,
          // confirmarPassword: this.form.controls.confirmarPassword.value,
          mailing: this.form.controls.mailing.value,
          terminos: this.form.controls.terminos.value,
        };
        this._usuarioService.insert(user_temp).subscribe((res: any) => {
          let codigo = new Date().getTime();
          this._mailingService
            .correoRegistroUsuario(res.usuario.email)
            .subscribe((res: any) => {});
          let datosCupon = {
            codigo: codigo,
            valor: '5',
            tipoCupon: 'Usuario',
            idUsuario: res.usuario._id,
          };
          this._cuponService.insert(datosCupon).subscribe((res2: any) => {});
          this._toastService.showNotification(
            'top',
            'center',
            'success',
            'Tus datos se han registrado correctamente'
          );
          Swal.fire(
            'Gracias por registrarte',
            'te has registrado exitosamente en despachate.com.mx inicia sesión a continuación',
            'success'
          );
          if (this.form.get('mailing').value) {
            this._mailingService
              .insert(this.form.value)
              .subscribe((res: any) => {
                this._toastService.showNotification(
                  'top',
                  'center',
                  'success',
                  'Te has registrado en el mailing'
                );
              });
          }
          //Registro de direccion
          let nombre_array: any[] = this.form.controls.nombre.value.split(' ');
          let direccion_temp: any = {
            nombre:
              nombre_array.length > 3
                ? nombre_array.slice(0, 3).join(' ')
                : nombre_array[0],
            apellidos:
              nombre_array.length > 3
                ? nombre_array.slice(3).join(' ')
                : nombre_array[1],
            codigoPostal: this.form.controls.codigoPostal.value,
            colonia: this.form.controls.colonia.value,
            numeroInterior: this.form.controls.numeroInterior.value,
            referencia: this.form.controls.referencia.value,
            calle: this.form.controls.calle.value,
            usuario: res.usuario._id,
          };
          this._direccionService
            .insert(direccion_temp)
            .subscribe((res_direccion: any) => {
              this.router.navigate(['/login']);
            });
        });
      }
      console.log(this.form.value);
    }
  }
}
