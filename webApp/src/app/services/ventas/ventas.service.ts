import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
declare var $;
@Injectable({
  providedIn: 'root',
})
export class VentasService {
  @BlockUI() blockUI: NgBlockUI;
  _url: string = `${URL_SERVICIOS}pedido/`;
  constructor(
    private http: HttpClient,
    public _toastService: ToastService,
    private router: Router
  ) {}

  get(pagina = 0, cuantos = 5) {
    return this.http.get(this._url).pipe(
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
  getpedidoXId(idPedido) {
    return this.http.get(`${this._url}${idPedido}`).pipe(
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
  getpedidoXusr(id) {
    return this.http.get(`${this._url}/pedidoXUsr/${id}`).pipe(
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
  insert(ventas: any) {
    return this.http.post(this._url, ventas).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this.blockUI.stop();
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al insertar'
        );
        this._toastService.errorsMessage(err);
        this.router.navigate(['/compraNoExitosa']);
        return throwError(err);
      })
    );
  }
  insertDetalles(ventas: any) {
    return this.http.post(`${this._url}/detalles`, ventas).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this.blockUI.stop();
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al insertar'
        );
        this._toastService.errorsMessage(err);
        this.router.navigate(['/compraNoExitosa']);
        return throwError(err);
      })
    );
  }
  insertHistorialCupones(cupones: any) {
    return this.http.post(`${this._url}historialCupones`, cupones).pipe(
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
  update(id: string, ventas: any) {
    return this.http.put(`${this._url}/${id}`, ventas).pipe(
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
  updateEstatusPago(id: string, ventas: any) {
    return this.http.put(`${this._url}/estatusPago/${id}`, ventas).pipe(
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
