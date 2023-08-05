import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

declare var $;
@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  _url: string = `${URL_SERVICIOS}categoria/`;
  constructor(private http: HttpClient, public _toastService: ToastService) {}
  get(params: any = {}) {
    return this.http.get(this._url, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al obtener'
        );
        return throwError(err);
      })
    );
  }
  getCatXDpto(dptoId) {
    return this.http.get(`${this._url}/catxdpto/${dptoId}`).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al obtener'
        );
        return throwError(err);
      })
    );
  }
  insert(categoria: any) {
    return this.http.post(this._url, categoria).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al insertar'
        );
        this._toastService.errorsMessage(err);
        return throwError(err);
      })
    );
  }
  update(id: string, categoria: any) {
    return this.http.put(`${this._url}/${id}`, categoria).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al actualizar'
        );
        this._toastService.errorsMessage(err);
        return throwError(err);
      })
    );
  }
  delete(id: string) {
    return this.http.delete(`${this._url}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al eliminar'
        );
        return throwError(err);
      })
    );
  }
}
