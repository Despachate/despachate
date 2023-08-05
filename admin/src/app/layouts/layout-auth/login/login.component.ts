import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  constructor(private _usuarioService:UsuariosService,
              private router:Router ) { }
  
  ngOnInit(): void {
    if(this._usuarioService.estaLogueado()){
      this.router.navigate(['/admin']);
    }
    this.form = new FormGroup({
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
     });
  }
    inicioSesion(){
      console.log(this.form.value);
      if(this.form.valid){
        this._usuarioService.Login(this.form.value).subscribe((data: any) => {
          console.log(data);
          this.router.navigate(['/admin']);
      });
      }
  
    }
  }


