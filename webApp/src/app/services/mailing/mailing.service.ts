import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { UsuariosService } from '../usuarios/usuarios.service';
@Injectable({
  providedIn: 'root'
})
export class MailingService {
  constructor( private http: HttpClient, public _toastService: ToastService, public _usuarioService: UsuariosService) { }

  get(usuario: string){
    return this.http.get(`${URL_SERVICIOS}mailing`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  insert(mailing: any){
    return this.http.post(`${URL_SERVICIOS}mailing/`, mailing).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al darte de alta en mailing')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  update(id: string, mailing: any){
    return this.http.put(`${URL_SERVICIOS}mailing/${id}`, mailing).pipe(
      map( (res: any) => {
        return res
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al actualizar')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  delete(id: string){
    return this.http.delete(`${URL_SERVICIOS}mailing/${id}`).pipe(
      map( (res: any) => {
        return res
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al eliminar')
      return throwError(err);
      })
    )
  }

  recuperarContrasenia(email: string){
    return this.http.post(`${URL_SERVICIOS}mailing/password/${email}`,{}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  enviarCupon(emails: string[], cupon:string){
    return this.http.post(`${URL_SERVICIOS}mailing/cupon/${cupon}`,{emails: emails,usuario: this._usuarioService.usuario}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar el correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  enviarConfirmacion(email: string,cliente: any,archivo:string){
    return this.http.post(`${URL_SERVICIOS}mailing/registrotienda/${email}`,{cliente, archivo}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar el correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  correoRegistroUsuario(email: string){
    return this.http.post(`${URL_SERVICIOS}mailing/registro/${email}`,{}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  correoCompraUsuario(email: string,compra:any, detalles:any, direccion: any, donado: number){
    return this.http.post(`${URL_SERVICIOS}mailing/compra/${email}`,{compra,detalles,direccion, donado}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  correoVentaAdmin(email: string,compra:any, detalles:any, direccion: any, donado: number, usuario: any, empaque: any){
    return this.http.post(`${URL_SERVICIOS}mailing/venta/${email}`,{compra,detalles,direccion, donado, usuario, empaque}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  regalarSaldoAmigo(email: string, saldo:string, user_amigo: string, mensaje_amigo: string){
    return this.http.post(`${URL_SERVICIOS}mailing/regalasaldoamigo/${email}`,{saldo, user_amigo, mensaje_amigo}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar el correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  regalarSaldoAmigoAdmin(user_origen: string, saldo:string, user_amigo: string){
    return this.http.post(`${URL_SERVICIOS}mailing/regalasaldoamigoadmin`,{saldo, user_amigo, user_origen}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar el correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  usoSaldoAmigoAdmin(user_origen: string, saldo:string){
    return this.http.post(`${URL_SERVICIOS}mailing/usosaldoamigoadmin`,{saldo, user_origen}).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al enviar el correo')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
}

