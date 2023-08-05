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
export class ProductosService {
  _url: string = `${URL_SERVICIOS}producto/`
  _url2: string = `${URL_SERVICIOS}detalleCarrito/`
  constructor(private http:HttpClient, public _toastService: ToastService) { }

  get(pagina = 0, cuantos = 5){
    return this.http.get(this._url).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getWithFiltros(filtros: any){
    return this.http.get(`${this._url}paginado`,{params: filtros}).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getVentas(pagina = 0, cuantos = 5){
    return this.http.get(`${this._url2}pages`,{params:{ hasta : '10' }}).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getByIdSubcat(idSubcat:any){
    return this.http.get(`${this._url}prodXsubcat/${idSubcat}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getById(id){
    return this.http.get(`${this._url}${id}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getByTermino(termino){
    return this.http.get(`${this._url}buscar/${termino}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getHintsByTermino(termino){
    return this.http.get(`${this._url}buscadorHint/`,{params:{termino}}).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getByEstiloVida(estiloVida){
    return this.http.get(`${this._url}estiloVida/${estiloVida}`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getNuevoBolsa(){
    return this.http.get(`${this._url}nuevoBolsa`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getRecomendadoParaTi(){
    return this.http.get(`${this._url}recomendadoParaTi`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  getRecomendadoFavoritos(){
    return this.http.get(`${this._url}recomendadoFavoritos`).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
    }));
  }
  insert(producto: any){
    return this.http.post(this._url, producto).pipe(map((res:any)=>{
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al guardar el registro')
      this._toastService.errorsMessage(err);
      return throwError(err);
    }));
  }
  insertMany(productos: any[]){
    return this.http.post(`${this._url}excel/`, productos).pipe(map((res:any)=>{
      console.log(res);
      return res;
    }), catchError((err: any)=>{
      this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al guardar los registros')
      this._toastService.errorsMessage(err);
      return throwError(err);
    }));
  }
  update(id: string, producto: any){
    return this.http.put(`${this._url}/${id}`, producto).pipe(map((res:any)=>{
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
