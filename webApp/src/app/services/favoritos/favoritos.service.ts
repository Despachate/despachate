import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  constructor( private http: HttpClient, public _toastService: ToastService) { }

  get(usuario: string){
    return this.http.get(`${URL_SERVICIOS}favorito/${usuario}`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  get3ProdFav(usuario: string){
    return this.http.get(`${URL_SERVICIOS}favorito/3prodFav/${usuario}`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  getProductosFavoritos(id: string, usuario) {
    return this.http.get(`${URL_SERVICIOS}favorito/producto/${id}/${usuario}`).pipe(
      map((res: any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  getProdFavoritos(idsProd:any[]) {
    return this.http.get(`${URL_SERVICIOS}favorito/prodFavorito`, {params: {arreglo: idsProd}}).pipe(
      map((res: any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }

  insert(favorito: any){
    return this.http.post(`${URL_SERVICIOS}favorito/`, favorito).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al guardar los registros')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }

  update(id: string, favorito: any){
    return this.http.put(`${URL_SERVICIOS}favorito/${id}`, favorito).pipe(
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
    return this.http.delete(`${URL_SERVICIOS}favorito/${id}`).pipe(
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
