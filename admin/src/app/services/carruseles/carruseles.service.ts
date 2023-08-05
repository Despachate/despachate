import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'environments/environment';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CarruselesService {
  _url: string = `${URL_SERVICIOS}carruseles/`
  constructor(private http:HttpClient, public _toastService: ToastService) { }
  get(pagina = 0, cuantos = 5){
    return this.http.get(this._url).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  insert(carrousel: any){
    return this.http.post(this._url, carrousel).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al insertar')
      this._toastService.errorsMessage(err);
      return throwError(err);
    }));
  }
  update(id: string, carrousel: any){
    return this.http.put(`${this._url}/${id}`, carrousel).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al actualizar')
      this._toastService.errorsMessage(err);
      return throwError(err);
    }));
  }
  delete(id:string){
    return this.http.delete(`${this._url}/${id}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al eliminar')
      return throwError(err);
    }));
  }
}
