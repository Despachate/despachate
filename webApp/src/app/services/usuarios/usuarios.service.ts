import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { Router } from '@angular/router';
import { CarritoService } from '../carrito/carrito.service';
declare var $;
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  _url: string = `${URL_SERVICIOS}usuario/`;
  usuario: any;
  token: string;
  routes: any;

  constructor(
    private http: HttpClient,
    public _toastService: ToastService,
    private router: Router
  ) {
    this.cargarStorage();
  }
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
  getByEmail(email: string) {
    return this.http.get(`${this._url}email/${email}`).pipe(
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

  getSaldo(id: string) {
    return this.http.get(`${this._url}saldo/${id}`).pipe(
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

  insert(usuario: any, message = true) {
    return this.http.post(this._url, usuario).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        if (message) {
          this._toastService.showNotification(
            'top',
            'center',
            'danger',
            'Ocurrio un error al insertar'
          );
          this._toastService.errorsMessage(err);
        }

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
  cambiarPassword(id: string, usuario: any) {
    return this.http.put(`${this._url}/cambiarPassword/${id}`, usuario).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err: any) => {
        this._toastService.showNotification(
          'top',
          'center',
          'danger',
          'Ocurrio un error al actualizar contraseña'
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
  Login(usuario, messaje = true) {
    return this.http.post(`${URL_SERVICIOS}login/user`, usuario).pipe(
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
        if (messaje)
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
    if (localStorage.getItem('token_despachate#20211001')) {
      this.token = localStorage.getItem('token_despachate#20211001');
      this.usuario = JSON.parse(
        localStorage.getItem('usuario_despachate#20211001')
      );
    } else {
      this.token = '';
      this.usuario = null;
    }
  }

  estaLogueado() {
    return this.token.length > 5 ? true : false;
  }

  getUsuario() {
    return JSON.parse(localStorage.getItem('usuario_despachate#20211001'));
  }

  guardarStorage(id: string, token: string, usuario: any) {
    localStorage.setItem('id_despachate#20211001', id);
    localStorage.setItem('token_despachate#20211001', token);
    localStorage.setItem(
      'usuario_despachate#20211001',
      JSON.stringify(usuario)
    );

    this.usuario = usuario;
    this.token = token;
  }

  logout() {
    this.usuario = null;
    this.token = '';
    localStorage.removeItem('token_despachate#20211001');
    localStorage.removeItem('id_despachate#20211001');
    localStorage.removeItem('usuario_despachate#20211001');
    this.router.navigate(['/login']);
  }
}
