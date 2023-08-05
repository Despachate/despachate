import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  _url: string = `${URL_SERVICIOS}inventario/`
  constructor(private http:HttpClient, public _toastService: ToastService) { }
  getByIdPrecio(precio:any,idsProd:any[]){
    return this.http.get(`${this._url}invXPrecio/${precio}`, {params: {arreglo: idsProd}}).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getById(id){
    return this.http.get(`${this._url}invProd/${id}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
}
