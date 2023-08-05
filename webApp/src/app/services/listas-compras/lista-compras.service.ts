import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/environments/environment';
import { CuponesDescuentosService } from '../cuponesDescuentos/cupones-descuentos.service';
import { ToastService } from '../toast/toast.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class ListaComprasService {
  producto_a_lista
  paquete_a_lista
  cantidad_a_lista
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
  public async agregarLista(nombre: string) {
    let lista: any[] = [];
    if (localStorage.getItem('listas_compras')) {
      lista = JSON.parse(localStorage.getItem('listas_compras'));
      let existe = false;
      lista.forEach(item => {
        if (`${item.nombre}`.toLocaleLowerCase() == nombre.toLowerCase()) {
          existe = true;
          this._toastService.showNotification(
            'top',
            'center',
            'danger',
            'Ocurrio un error al agregar'
          );
          return false;
        }
      });
      if (!existe) {
        lista.push({
          _id: `${new Date().getTime() }`,
          nombre: nombre,
          lista: []
        })
        this.lista = lista;
        this.toast.showNotification(
          'top',
          'center',
          'success',
          `Lista agregada correctamente `
        );
        localStorage.setItem('listas_compras', JSON.stringify(lista));
        await this.getItemsCarrito();
        return true;

      }
    } else {
      lista.push({
        _id: `${new Date().getTime() }`,
        nombre: nombre,
        lista: []
      })
      this.lista = lista;
      this.toast.showNotification(
        'top',
        'center',
        'success',
        `Lista agregada correctamente `
      );
      localStorage.setItem('listas_compras', JSON.stringify(lista));
      return true;

    }
  }
  public async agregarAlCarrito(
    producto: any,
    cantidad: number,
    paquete: any,
    oferta: number = 0,
    nombre_lista
  ) {
    let lista: any[] = [];
    if (localStorage.getItem('listas_compras')) {
      lista = JSON.parse(localStorage.getItem('listas_compras'));
      let existe = false;
      lista.forEach(element => {
        if (element.nombre == nombre_lista) {
          for (const item of element.lista) {

            if (
              item.producto._id === producto._id &&
              item.tipo === item.tipo &&
              item.paquete._id === paquete._id
            ) {
              item.cantidad += cantidad;
              item.total += paquete.precio * cantidad;
              /* let carrito = await this.update(item._id, {
                producto: item.producto._id,
                cantidad: item.cantidad,
                paquete: item.paquete._id,
                oferta: item.oferta,
                total: item.total,
                usuario: item.usuario ? item.usuario._id : undefined,
                fecha: item.fecha,
              }).toPromise(); */
              existe = true;
            }
          }
          if (!existe) {
            element.lista.push(
              {
                producto: producto,// producto._id,
                cantidad,
                paquete: paquete, // paquete._id,
                oferta,
                total: paquete.precio * cantidad,
                usuario: this._usuarioService.usuario
                  ? this._usuarioService.usuario._id
                  : undefined,
                fecha: new Date(),
              }
            );
            /* let carrito = await this.insert({
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
            carrito = await this.getOne(carrito.carrito._id).toPromise(); */
            // console.log('add carrito', carrito);


            this.toast.showNotification(
              'top',
              'center',
              'success',
              `Se agrego correctamente ${cantidad} ${producto.nombre}`
            );
          } else {

            this.toast.showNotification(
              'top',
              'center',
              'success',
              `Se agrego correctamente ${cantidad} ${producto.nombre}`
            );
          }
        }

      });
      this.lista = lista;
      localStorage.setItem('listas_compras', JSON.stringify(lista));
    } else {
      // console.log('no existe el carrito');
      /*  let carrito = await this.insert({
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
       carrito = await this.getOne(carrito.carrito._id).toPromise(); */
      // console.log('add carrito', carrito);
      /* lista.push({});
      this.toast.showNotification(
        'top',
        'center',
        'success',
        `Se agrego correctamente ${cantidad} ${producto.nombre}`
      );
      this.lista = lista; */
    }
    localStorage.setItem('listas_compras', JSON.stringify(lista));
    /* this.findCupones(producto, paquete); */
  }
  public async getItemsCarrito() {
    console.log('get listas');
    this.lista = localStorage.getItem('listas_compras')
      ? JSON.parse(localStorage.getItem('listas_compras'))
      : [];
    console.log(this.lista);
    if (this._usuarioService.estaLogueado() && !!this._usuarioService.usuario) {
      /*  let carritos = await this.getByUsr(
         this._usuarioService.usuario._id
       ).toPromise();
       // console.log(carritos.carrito);
       // let lista = carritos.carrito;
       this.lista = carritos.carrito.filter(
         (item) => !!item.paquete && !!item.producto
       );

       this.guardarCarrito(this.lista); */
    }
    // console.log(this.lista);
    return localStorage.getItem('listas_compras')
      ? JSON.parse(localStorage.getItem('listas_compras'))
      : [];
  }
  public getItems() {
    return this.lista;
  }

  // tslint:disable-next-line: variable-name
  public async eliminarItem(item) {
    const listaTemp = [];
    /* for (const item of this.lista) {
      if (item.paquete._id !== _id) {
        listaTemp.push(item);
      } else {
         let carrito = await this.delete(item._id).toPromise();
      }
    } */
    if (!!item._id) {

    } else {
      this.lista.forEach(element => {
        if (element.nombre != item.nombre) listaTemp.push(element)
      });
    }
    this.lista = listaTemp;
    localStorage.setItem('listas_compras', JSON.stringify(listaTemp));
  }
  public async eliminarItemDetalle(nombre_lista, idx_pro) {
    const listaTemp = [];
    /* for (const item of this.lista) {
      if (item.paquete._id !== _id) {
        listaTemp.push(item);
      } else {
         let carrito = await this.delete(item._id).toPromise();
      }
    } */


      this.lista.forEach(element => {
        if (element.nombre == nombre_lista) {
          element.lista.splice(idx_pro, 1);
        }
      });
      localStorage.setItem('listas_compras', JSON.stringify(this.lista));
    // this.lista = listaTemp;
    // localStorage.setItem('listas_compras', JSON.stringify(listaTemp));
  }

  public async limpiarCarrito() {
    for (const item of this.lista) {
      /* let carrito = await this.delete(item._id).toPromise(); */
    }
    this.lista = [];
    localStorage.removeItem('listas_compras');
  }

  public async limpiarStorage() {
    this.lista = [];
    localStorage.removeItem('listas_compras');
  }

  /*   public async guardarCarrito(lista: any[] = this.lista) {
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
      localStorage.setItem('listas_compras', JSON.stringify(lista));
    } */

  /* get(pagina = 0, cuantos = 5) {
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
  } */
  /* getOne(id: string, pagina = 0, cuantos = 5) {
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
  } */
  /*  getByUsr(id) {
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
   } */
  /* insert(carrito: any) {
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
  } */
  /* update(id: string, carrito: any) {
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
  } */
  /* delete(id: string) {
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
 */
  /* public findCupones(producto: any, paquete: any) {
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
          let cupones_usados = !!localStorage.getItem('cupones_usados')
            ? JSON.parse(localStorage.getItem('cupones_usados'))
            : [];
          cupones_usados = [...cupones_usados, cupon._id];
          cupones_usados = cupones_usados.filter(
            (item, index) => cupones_usados.indexOf(item) === index
          );
          // eliminar repetidos
          localStorage.setItem(
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
  } */

  public registrarUsoCupon(compra: any) {
    // this._cuponesDescuentoService.registrarUsoCupon(cupon, compra).subscribe((res:any)=>{
    //   console.log('%c res cupon', 'color: orange', res);
    // })
  }
}
