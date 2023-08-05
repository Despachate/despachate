import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoSuscripcionService {

  constructor( private http: HttpClient, public _toastService: ToastService) { }

  get(usuario: string){
    return this.http.get(`${URL_SERVICIOS}carritoSuscripcion`).pipe(

      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  UsuarioSuscripcion(idUsuario: string){
    return this.http.get(`${URL_SERVICIOS}carritoSuscripcion/${idUsuario}`).pipe(

      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  insert(carritoSuscripcion: any){
    return this.http.post(`${URL_SERVICIOS}carritoSuscripcion/`, carritoSuscripcion).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio al darte de alta en carritoSuscripcion')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  update(id: string, carritoSuscripcion: any){
    return this.http.put(`${URL_SERVICIOS}carritoSuscripcion/${id}`, carritoSuscripcion).pipe(
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
    return this.http.delete(`${URL_SERVICIOS}carritoSuscripcion/${id}`).pipe(
      map( (res: any) => {
        return res
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al eliminar')
      return throwError(err);
      })
    )
  }
}
