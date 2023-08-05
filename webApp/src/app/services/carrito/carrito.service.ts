import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/environments/environment';
import { ToastService } from '../toast/toast.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CuponesDescuentosService } from '../cuponesDescuentos/cupones-descuentos.service';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  public lista: any[] = [];
  _url: string = `${URL_SERVICIOS}carrito/`;
  constructor(
    private toast: ToastService,
    private http: HttpClient,
    public _toastService: ToastService,
    private _usuarioService: UsuariosService,
    private _cuponesDescuentoService: CuponesDescuentosService
  ) {
    this.getItemsCarrito();
  }

  public async agregarAlCarrito(
    producto: any,
    cantidad: number,
    paquete: any,
    oferta: number = 0
  ) {
    let lista: any[] = [];
    if (sessionStorage.getItem('carrito')) {
      lista = JSON.parse(sessionStorage.getItem('carrito'));
      let existe = false;
      for (const item of lista) {
        if (
          item.producto._id === producto._id &&
          item.tipo === item.tipo &&
          item.paquete._id === paquete._id
        ) {
          item.cantidad += cantidad;
          item.total += paquete.precio * cantidad;
          let carrito = await this.update(item._id, {
            producto: item.producto._id,
            cantidad: item.cantidad,
            paquete: item.paquete._id,
            oferta: item.oferta,
            total: item.total,
            usuario: item.usuario ? item.usuario._id : undefined,
            fecha: item.fecha,
          }).toPromise();
          existe = true;
        }
      }
      if (!existe) {
        let carrito = await this.insert({
          producto: producto._id,
          cantidad,
          paquete: paquete._id,
          oferta,
          total: paquete.precio * cantidad,
          usuario: this._usuarioService.usuario
            ? this._usuarioService.usuario._id
            : undefined,
          fecha: new Date(),
        }).toPromise();
        carrito = await this.getOne(carrito.carrito._id).toPromise();
        // console.log('add carrito', carrito);
        lista.push(carrito.carrito);
        this.lista = lista;
        this.toast.showNotification(
          'top',
          'center',
          'success',
          `Se agrego correctamente ${cantidad} ${producto.nombre}`
        );
      } else {
        this.lista = lista;
        this.toast.showNotification(
          'top',
          'center',
          'success',
          `Se agrego correctamente ${cantidad} ${producto.nombre}`
        );
      }
    } else {
      // console.log('no existe el carrito');
      let carrito = await this.insert({
        producto: producto._id,
        cantidad,
        paquete: paquete._id,
        oferta,
        total: paquete.precio * cantidad,
        usuario: this._usuarioService.usuario
          ? this._usuarioService.usuario._id
          : undefined,
        fecha: new Date(),
      }).toPromise();
      carrito = await this.getOne(carrito.carrito._id).toPromise();
      // console.log('add carrito', carrito);
      lista.push(carrito.carrito);
      this.toast.showNotification(
        'top',
        'center',
        'success',
        `Se agrego correctamente ${cantidad} ${producto.nombre}`
      );
      this.lista = lista;
    }
    sessionStorage.setItem('carrito', JSON.stringify(lista));
    this.findCupones(producto, paquete);
  }
  public async getItemsCarrito() {
    this.lista = sessionStorage.getItem('carrito')
      ? JSON.parse(sessionStorage.getItem('carrito'))
      : [];
    if (this._usuarioService.estaLogueado() && !!this._usuarioService.usuario) {
      let carritos = await this.getByUsr(
        this._usuarioService.usuario._id
      ).toPromise();
      // console.log(carritos.carrito);
      // let lista = carritos.carrito;
      this.lista = carritos.carrito.filter(
        (item) => !!item.paquete && !!item.producto
      );

      this.guardarCarrito(this.lista);
    }
    // console.log(this.lista);
    return sessionStorage.getItem('carrito')
      ? JSON.parse(sessionStorage.getItem('carrito'))
      : [];
  }
  public getItems() {
    return this.lista;
  }

  // tslint:disable-next-line: variable-name
  public async eliminarItem(_id) {
    const listaTemp = [];
    for (const item of this.lista) {
      if (item.paquete._id !== _id) {
        listaTemp.push(item);
      } else {
        let carrito = await this.delete(item._id).toPromise();
      }
    }
    this.lista = listaTemp;
    sessionStorage.setItem('carrito', JSON.stringify(listaTemp));
  }

  public async limpiarCarrito() {
    for (const item of this.lista) {
      let carrito = await this.delete(item._id).toPromise();
    }
    this.lista = [];
    sessionStorage.removeItem('carrito');
  }

  public async limpiarStorage() {
    this.lista = [];
    sessionStorage.removeItem('carrito');
  }

  public async guardarCarrito(lista: any[] = this.lista) {
    for (const item of lista) {
      item.usuario = this._usuarioService.usuario
        ? this._usuarioService.usuario._id
        : undefined;
      if (!item.paquete) {
        await this.delete(item._id).toPromise();
      } else if (!item.producto) {
        await this.delete(item._id).toPromise();
      } else {
        let carrito = await this.update(item._id, {
          producto: item.producto?._id,
          cantidad: item.cantidad,
          paquete: item.paquete?._id,
          cupon: !!item.cupon ? item.cupon : undefined,
          oferta: item.oferta,
          total: item.total,
          usuario: this._usuarioService.usuario
            ? this._usuarioService.usuario._id
            : undefined,
          fecha: item.fecha,
        }).toPromise();
      }
      // console.log('guardar carrito ', carrito, item);
    }
    sessionStorage.setItem('carrito', JSON.stringify(lista));
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
  getOne(id: string, pagina = 0, cuantos = 5) {
    return this.http.get(`${this._url}/${id}`).pipe(
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
  getByUsr(id) {
    return this.http.get(`${this._url}/detalleUsuario/${id}`).pipe(
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
  insert(carrito: any) {
    return this.http.post(this._url, carrito).pipe(
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
  update(id: string, carrito: any) {
    return this.http.put(`${this._url}/${id}`, carrito).pipe(
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

  public findCupones(producto: any, paquete: any) {
    const { _id, departamento, categoria, subcategoria } = producto;
    let params = {
      producto: _id,
      departamento: departamento._id,
      categoria: categoria._id,
      subcategoria: subcategoria._id,
    };

    // remove undefined
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    this._cuponesDescuentoService.get(params).subscribe((res: any) => {
      console.log('%c res cupon', 'color: orange', res);
      console.log('%c paquete', 'color: orange', paquete, producto);
      if (res.cupones.length > 0) {
        let cupon = res.cupones[0];
        if (cupon) {
          // Verificamos la caducidad del cupon
          if (cupon.caduca == true) {
            console.log('%c cupon caduca', 'color: orange');
            if (cupon.tipoCaducidad == 'fecha') {
              console.log('%c caducidad fecha', 'color: orange');
              let now = new Date();
              let fechaCaducidad = new Date(cupon.fechaCaducidad);
              let fechaInicio = new Date(cupon.fechaInicio);
              if (
                fechaInicio.getTime() > now.getTime() ||
                new Date(cupon.fechaCaducidad).getTime() > new Date().getTime()
              ) {
                console.log(
                  '%c cupon no vigente',
                  'color: orange',
                  fechaInicio.getTime(),
                  now.getTime(),
                  fechaInicio.getTime() > now.getTime(),
                  fechaCaducidad.getTime(),
                  now.getTime(),
                  now.getTime() < fechaCaducidad.getTime()
                );
                return;
              }
            } else {
              console.log('%c caducidad intentos', 'color: orange');
              if (cupon.intentos >= cupon.intentosMaximos) {
                console.log('%c cupon no vigente', 'color: orange');
                return;
              }
            }
          }
          console.log('%c cupon', 'color: red', 'SE APLICARA CUPON');
          // Calcular desuento y aplicarlo a la oferta
          let descuento: number =
            cupon.tipo === '%'
              ? (paquete.precio * cupon.valor) / 100
              : cupon.valor;
          console.log('%c descuento', 'color: red', descuento);

          let item = this.lista.find(
            (item) =>
              item.producto._id === producto._id &&
              item.paquete._id === paquete._id
          );

          item.oferta = descuento;
          item.cupon = cupon._id;

          item.total = (paquete.precio - descuento) * item.cantidad;
          this.guardarCarrito();
          let cupones_usados = !!sessionStorage.getItem('cupones_usados')
            ? JSON.parse(sessionStorage.getItem('cupones_usados'))
            : [];
          cupones_usados = [...cupones_usados, cupon._id];
          cupones_usados = cupones_usados.filter(
            (item, index) => cupones_usados.indexOf(item) === index
          );
          // eliminar repetidos
          sessionStorage.setItem(
            'cupones_usados',
            JSON.stringify(cupones_usados)
          );
          this._toastService.showNotification(
            'top',
            'center',
            'success',
            'Cupon aplicado: descuento $' + descuento
          );
          // this.guardarCarrito();
        }
      }
    });
  }

  public registrarUsoCupon(compra: any) {
    // this._cuponesDescuentoService.registrarUsoCupon(cupon, compra).subscribe((res:any)=>{
    //   console.log('%c res cupon', 'color: orange', res);
    // })
  }
}
