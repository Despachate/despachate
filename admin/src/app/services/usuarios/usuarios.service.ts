import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { Router } from '@angular/router';

declare var $;
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  usuario: any = null;
  token: string = '';
  routes: any;
  _url: string = `${URL_SERVICIOS}usuario/`;
  constructor(
    private http: HttpClient,
    public _toastService: ToastService,
    private router: Router
  ) {
    this.cargarStorage();
  }
  get(params: any = {}) {
    return this.http.get(this._url, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err) => {
        var mensaje = '';
        if (err.error.mensaje) {
          mensaje = err.error.mensaje;
        } else {
          mensaje = 'Ocurrio un error';
        }
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al obtener los datos'
        );
        return throwError(err);
      })
    );
  }
  getCupones(pagina = 0, cuantos = 5) {
    return this.http.get(`${this._url}concupon/`).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err) => {
        var mensaje = '';
        if (err.error.mensaje) {
          mensaje = err.error.mensaje;
        } else {
          mensaje = 'Ocurrio un error';
        }
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al obtener los datos'
        );
        return throwError(err);
      })
    );
  }
  insert(usuario: any) {
    return this.http.post(this._url, usuario).pipe(
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
  update(id: string, usuario: any) {
    return this.http.put(`${this._url}/${id}`, usuario).pipe(
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
  modificarSaldo(email: string, saldo) {
    return this.http.put(`${this._url}/modificarSaldo/${email}`, saldo).pipe(
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
  changePassword(id: string) {
    return this.http.put(`${this._url}/cambiarPasswordAdmin/${id}`, {}).pipe(
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
  /*Login resgistro Usuario*/
  Login(usuario) {
    return this.http.post(`${URL_SERVICIOS}login/admin`, usuario).pipe(
      map((res: any) => {
        this.guardarStorage(res.usuario.id, res.token, res.usuario);
        return res;
      }),
      catchError((err) => {
        var mensaje = '';
        if (err.error.mensaje) {
          mensaje = err.error.mensaje;
        } else {
          mensaje = 'Ocurrio un error';
        }
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Los datos que ingresaste son incorrectos'
        );
        return throwError(err);
      })
    );
  }

  cargarStorage() {
    if (localStorage.getItem('tokenAdmin')) {
      this.token = localStorage.getItem('tokenAdmin');
      this.usuario = JSON.parse(localStorage.getItem('usuarioAdmin'));
    } else {
      this.token = '';
      this.usuario = null;
    }
  }

  estaLogueado() {
    return this.token.length > 5 ? true : false;
  }

  guardarStorage(id: string, token: string, usuario: any) {
    localStorage.setItem('id', id);
    localStorage.setItem('tokenAdmin', token);
    localStorage.setItem('usuarioAdmin', JSON.stringify(usuario));

    this.usuario = usuario;
    this.token = token;
  }

  logout() {
    this.usuario = null;
    this.token = '';
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('usuario');
    this.router.navigate(['/auth']);
  }
}
