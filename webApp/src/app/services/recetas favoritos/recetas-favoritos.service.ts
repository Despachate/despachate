import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class RecetasFavoritosService {
  constructor(private http: HttpClient, public _toastService: ToastService) {}

  get(usuario: string) {
    return this.http.get(`${URL_SERVICIOS}recetas_favorito/${usuario}`).pipe(
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
  getFavorito(receta: string, usuario: string) {
    return this.http
      .get(`${URL_SERVICIOS}recetas_favorito/isFavorito/${usuario}/${receta}`)
      .pipe(
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
  getFavoritos(usuario: string, params: any = {}) {
    return this.http
      .get(`${URL_SERVICIOS}recetas_favorito/receta_usuario/${usuario}`, {
        params,
      })
      .pipe(
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
  getFavoritoReceta(receta: string) {
    return this.http.get(`${URL_SERVICIOS}recetas_favorito/${receta}`).pipe(
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
  getProdFavoritos(idsProd: any[]) {
    return this.http
      .get(`${URL_SERVICIOS}recetas_favorito/prodFavorito`, {
        params: { arreglo: idsProd },
      })
      .pipe(
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

  insert(favorito: any) {
    return this.http.post(`${URL_SERVICIOS}recetas_favorito/`, favorito).pipe(
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

  update(id: string, favorito: any) {
    return this.http
      .put(`${URL_SERVICIOS}recetas_favorito/${id}`, favorito)
      .pipe(
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
    return this.http.delete(`${URL_SERVICIOS}recetas_favorito/${id}`).pipe(
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
