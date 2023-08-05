import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
declare var $;

@Injectable({
  providedIn: 'root'
})
export class DonacionService {

  _url: string = `${URL_SERVICIOS}donacion/`
  constructor(private http:HttpClient, public _toastService: ToastService) { }
  getDonacionActiva(pagina = 0, cuantos = 5){
    return this.http.get(`${this._url}donacionActiva`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
}
