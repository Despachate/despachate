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
export class ProductosService {
  _url: string = `${URL_SERVICIOS}producto/`;
  constructor(private http: HttpClient, public _toastService: ToastService) {}

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
  getWithFiltros(filtros: any) {
    return this.http.get(`${this._url}paginado`, { params: filtros }).pipe(
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
  getCompiled(params: any) {
    return this.http.get(`${this._url}compilado`, { params }).pipe(
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
  getCompiled2(pagina = 0, cuantos = 5) {
    return this.http.get(`${this._url}compiladov2`).pipe(
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
  getById(id) {
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
  insert(producto: any) {
    return this.http.post(this._url, producto).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al guardar el registro'
        );
        this._toastService.errorsMessage(err);
        return throwError(err);
      })
    );
  }
  insertMany(productos: any[]) {
    return this.http.post(`${this._url}excel/`, productos).pipe(
      map((res: any) => {
        console.log(res);
        console.log('mensaje service', res);
        this._toastService.showNotification(
          'top',
          'center',
          'success',
          res.error.productos.length + ' Productos guardados correctamente'
        );
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'No se insertarón ' +
            res.error.errors.length +
            ' registros verifica la información'
        );
        return res;
      }),
      catchError((err: any) => {
        /*       this._toastService.showNotification('top', 'center', 'danger','Ocurrio un error al guardar los registros')
         */ this._toastService.errorsMessage(err);
        this._toastService.showNotification(
          'top',
          'center',
          'success',
          err.error.productos
            ? err.error.productos.length + ' Productos guardados correctamente'
            : 'todos los' + ' Productos guardados correctamente'
        );
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'No se insertarón ' +
            err.error.errors.length +
            ' registros verifica la información'
        );
        console.log('datos err', err);
        return throwError(err);
      })
    );
  }
  update(id: string, producto: any) {
    return this.http.put(`${this._url}/${id}`, producto).pipe(
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

  getHintsByTermino(termino) {
    return this.http
      .get(`${this._url}paginado/`, { params: { search: termino, limit: '8' } })
      .pipe(
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

  duplicar(id: string) {
    return this.http.post(`${this._url}duplicar/${id}`, {}).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al duplicar'
        );
        return throwError(err);
      })
    );
  }

  ocultar(id: string) {
    return this.http.post(`${this._url}ocultar/${id}`, {}).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al ocultar'
        );
        return throwError(err);
      })
    );
  }

  adm_favoritos(id: string) {
    return this.http.post(`${this._url}adm_favoritos/${id}`, {}).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al ocultar'
        );
        return throwError(err);
      })
    );
  }
}
