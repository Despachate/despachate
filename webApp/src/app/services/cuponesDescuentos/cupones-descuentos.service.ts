import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/environments/environment';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CuponesDescuentosService {
  _url: string = `${URL_SERVICIOS}cuponDescuento/`;
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

  getXId(id: string) {
    return this.http.get(`${this._url}${id}`).pipe(
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
}
