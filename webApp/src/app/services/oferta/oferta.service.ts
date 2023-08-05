import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  _url: string = `${URL_SERVICIOS}oferta/`
  constructor(private http:HttpClient, public _toastService: ToastService) { }
  get(pagina = 0, cuantos = 7){
    return this.http.get(`${this._url}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getXProducto(idProducto){
    return this.http.get(`${this._url}producto/${idProducto}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
}
