import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { Router } from '@angular/router';
import { MailingService } from '../../services/mailing/mailing.service';
import { CarritoService } from '../../services/carrito/carrito.service';
import { SocialLoginService } from '../../services/social-login/social-login.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  constructor(
    private _usuarioService: UsuariosService,
    private _mailingService: MailingService,
    private router: Router,
    private _carritoService: CarritoService,
    public _socialLoginService: SocialLoginService
  ) {}

  ngOnInit(): void {
    if (this._usuarioService.estaLogueado) {
      this.router.navigate(['/miCuenta']);
    }
    this.form = new FormGroup({
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    });
    this._socialLoginService.logout();
  }
  inicioSesion() {
    if (this.form.valid) {
      this._usuarioService.Login(this.form.value).subscribe((data: any) => {
        this._carritoService.guardarCarrito().then(()=>{
          this._carritoService.getItemsCarrito();
          this.router.navigate(['/miCuenta']);
        });
      });
    }
  }
  recuperarContrasenia() {
    if (this.form.get('email').valid) {
      this._mailingService
        .recuperarContrasenia(this.form.get('email').value)
        .subscribe((res: any) => {
          this._usuarioService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Se ha enviado un correo con tu nueva contraseña'
          );
        });
    } else {
      this._usuarioService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Introduce un correo valido'
      );
    }
  }
  
  ingresar(proveedor: string) {
    console.log('proveedor', proveedor);
    this._socialLoginService.login(proveedor)
  }
}
