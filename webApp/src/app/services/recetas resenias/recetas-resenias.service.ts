import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class RecetasReseniasService {
  constructor(private http: HttpClient, public _toastService: ToastService) {}

  get(id: string) {
    return this.http.get(`${URL_SERVICIOS}recetas_resenia/receta/${id}`).pipe(
      map((res: any) => res),
      catchError((err) => {
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

  insert(resenia: any) {
    return this.http.post(`${URL_SERVICIOS}recetas_resenia/`, resenia).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al guardar los registros'
        );
        this._toastService.errorsMessage(err);
        return throwError(err);
      })
    );
  }

  update(id: string, resenia: any) {
    return this.http.put(`${URL_SERVICIOS}recetas_resenia/${id}`, resenia).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err) => {
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
    return this.http.delete(`${URL_SERVICIOS}recetas_resenia/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err) => {
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
