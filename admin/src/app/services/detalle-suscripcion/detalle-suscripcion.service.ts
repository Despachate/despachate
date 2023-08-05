import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class DetalleSuscripcionService {
  constructor( private http: HttpClient, public _toastService: ToastService) { }

  get(usuario: string){
    return this.http.get(`${URL_SERVICIOS}detalleSuscripcion`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  getXIdCarSus(idCarSus: string){
    return this.http.get(`${URL_SERVICIOS}detalleSuscripcion/detXIdCarSus/${idCarSus}`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  getProducto(idCarrSus: string, idProd: string){
    return this.http.get(`${URL_SERVICIOS}detalleSuscripcion/obtenerProducto/${idCarrSus}/${idProd}`).pipe(
      map((res:any) => res),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al obtener')
      return throwError(err);
      })
    );
  }
  insert(detalleSuscripcion: any){
    return this.http.post(`${URL_SERVICIOS}detalleSuscripcion/`, detalleSuscripcion).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio al darte de alta en detalleSuscripcion')
      this._toastService.errorsMessage(err);
      return throwError(err);
      })
    )
  }
  public agregarASuscripcion(producto: any, cantidad: number) {

    let lista = [];
    if (producto) {
      lista = producto;
      let existe = false;
      for (const item of lista) {
        if (item.producto._id === producto._id) {
          item.cantidad += cantidad;
          item.total += (producto.precio * cantidad);
          existe = true;
      }
    }
  }
  return lista;
  }
  update(id: string, detalleSuscripcion: any){
    return this.http.put(`${URL_SERVICIOS}detalleSuscripcion/${id}`, detalleSuscripcion).pipe(
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

  updateCantidadProductos(idCarrSus: string, idProd: string, cantidad : any){
    return this.http.put(`${URL_SERVICIOS}detalleSuscripcion/actCantProd/${idCarrSus}/${idProd}`,cantidad).pipe(
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
    return this.http.delete(`${URL_SERVICIOS}detalleSuscripcion/${id}`).pipe(
      map( (res: any) => {
        return res
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al eliminar')
      return throwError(err);
      })
    )
  }
  deleteProducto(idCarrSus: string, idProd: string){
    return this.http.delete(`${URL_SERVICIOS}detalleSuscripcion/eliminarProd/${idCarrSus}/${idProd}`).pipe(
      map( (res: any) => {
        return res
      }),
      catchError( err => {
       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al eliminar')
      return throwError(err);
      })
    )
  }
  deleteDetalles(idCarrSus: string){
    return this.http.delete(`${URL_SERVICIOS}detalleSuscripcion/eliminarDetalles/${idCarrSus}`).pipe(
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

