import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { URL_SERVICIOS } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DireccionService {
  constructor( private http: HttpClient, public _toastService: ToastService) { }

  get(direccion: string){
    return this.http.get(`${URL_SERVICIOS}direccion`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  getDireccionesxUsuario(idUsuario: string){
    return this.http.get(`${URL_SERVICIOS}direccion/dirXUsuario/${idUsuario}`).pipe(
      map((res:any) => res.direccion),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  insert(direccion: any){
    return this.http.post(`${URL_SERVICIOS}direccion/`, direccion).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al dar de alta la direccion')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  update(id: string, direccion: any){
    return this.http.put(`${URL_SERVICIOS}direccion/${id}`, direccion).pipe(
      map( (res: any) => {
        return res
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al actualizar la dirección')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  delete(id: string){
    return this.http.delete(`${URL_SERVICIOS}direccion/${id}`).pipe(
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

