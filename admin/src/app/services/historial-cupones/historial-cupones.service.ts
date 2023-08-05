import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HistorialCuponesService {
  private url = `${URL_SERVICIOS}historial_cupones`;
  constructor(private http: HttpClient, private toast: ToastService) {}
  get(params: any) {
    return this.http.get(`${this.url}`, { params }).pipe(
      map((resp: any) => resp),
      catchError((err) => this.handleError(err))
    );
  }

  insert(obj: any): Observable<any> {
    return this.http.post(`${this.url}`, obj).pipe(
      map((resp: any) => resp),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, obj: any): Observable<any> {
    return this.http.put(`${this.url}${id}`, obj).pipe(
      map((resp: any) => resp),
      catchError((err) => this.handleError(err))
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.url}${id}`).pipe(
      map((resp: any) => resp),
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(error: any) {
    this.toast.showNotification(
      'top',
      'right',
      'danger',
      'Error al procesar la petición'
    );
    return throwError(error || 'NodeJS server error');
  }
}
