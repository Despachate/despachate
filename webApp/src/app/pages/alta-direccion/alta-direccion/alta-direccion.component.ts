import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DireccionService } from '../../../services/direcciones/direccion.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';

@Component({
  selector: 'app-alta-direccion',
  templateUrl: './alta-direccion.component.html',
  styleUrls: ['./alta-direccion.component.css'],
})
export class AltaDireccionComponent implements OnInit {
  form: FormGroup;
  public datosUsuario: any[] = [];
  constructor(
    private location: Location,
    private router: Router,
    private _direccionService: DireccionService,
    private _toastService: ToastService,
    private _usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.datosUsuario.push(
      JSON.parse(localStorage.getItem('usuario_despachate#20211001'))
    );
    console.log('dtos_usuario', this.datosUsuario);
    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      apellidos: new FormControl(null, Validators.required),
      codigoPostal: new FormControl(null, Validators.required),
      colonia: new FormControl(null, Validators.required),
      numeroInterior: new FormControl(null),
      referencia: new FormControl(null, Validators.required),
      calle: new FormControl(null, Validators.required),
      telefono: new FormControl(this.datosUsuario[0].telefono, Validators.required),
    });
  }

  back() {
    this.location.back();
  }
  altaDirecccion() {
    let id = this.datosUsuario[0]._id;
    
    this._direccionService
      .insert({ ...this.form.value, usuario: id })
      .subscribe((res: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'success',
          'La dirección se registro correctamente'
        );
        this.actualizarDatos();
        // this.router.navigate(['/miCuenta']);
      });
    console.log(this.form.value);
  }
  actualizarDatos() {
    this._usuarioService.update(this.datosUsuario[0]._id,{...this.datosUsuario[0], telefono: this.form.value.telefono, role:'USER_ROLE'}).subscribe((res:any)=>{
      // this._toastService.showNotification("top","center","success","Tus datos personales han sido actualizados correctamente" );
      this._usuarioService.guardarStorage(this.datosUsuario[0]._id,this._usuarioService.token,res.usuario);
      this._usuarioService.cargarStorage();
      this.router.navigate(['/miCuenta']);
    });
  }
}
