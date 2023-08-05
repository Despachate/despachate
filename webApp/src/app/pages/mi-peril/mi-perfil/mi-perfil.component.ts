import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from '../../../services/toast/toast.service';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { URL_IMGS } from 'src/environments/environment';
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
  public datosUsuario: any[] = [];
  public telefono:String;
  public imgEditar = '';
  public urlUser = `${URL_IMGS}usuarios/`;
  constructor(private location: Location,
              private _toastService : ToastService,
              private router:Router,
              private _usuarioService : UsuariosService) { }
              form: FormGroup;
  ngOnInit(): void {
    this.datosUsuario.push(JSON.parse(localStorage.getItem('usuario')));
    this.imgEditar = this._usuarioService.usuario.img;
    console.log(this.datosUsuario);
    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      telefono: new FormControl(null, Validators.required),
     });
     if(this.datosUsuario[0].telefono){
        this.telefono = this.datosUsuario[0].telefono;
     }else{
        this.telefono = "";
     }
     this.form.setValue({
      nombre: this.datosUsuario[0].nombre,
      email: this.datosUsuario[0].email,
      telefono: this.telefono,
    });
  }
  back(){
    this.location.back();
  }
  actualizarDatos(){
    this._usuarioService.update(this.datosUsuario[0]._id,{...this.form.value, role:'USER_ROLE'}).subscribe((res:any)=>{
      this._toastService.showNotification("top","center","success","Tus datos personales han sido actualizados correctamente" );
      this._usuarioService.guardarStorage(this.datosUsuario[0]._id,this._usuarioService.token,res.usuario);
      this._usuarioService.cargarStorage();
      this.router.navigate(['/miCuenta']);
    });
  }
}
