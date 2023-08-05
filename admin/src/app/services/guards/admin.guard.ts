import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuariosService } from '../usuarios/usuarios.service';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private usuarioService: UsuariosService, public router: Router){}
  canActivate(){

    console.log('paso por el login guard')
    if(this.usuarioService.usuario != null && this.usuarioService.usuario.role == 'ADMIN_ROLE' ){
      return true;
    }else{
      console.log('bloqueado')
      this.router.navigate(['/auth']);
      return false;
    } 
   
    return true;
  }
  
}
