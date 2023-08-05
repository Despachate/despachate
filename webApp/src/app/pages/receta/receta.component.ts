import { Component, OnInit } from '@angular/core';
import { RecetasIngredientesService } from '../../services/recetas ingredientes/recetas-ingredientes.service';
import { RecetasPasosService } from '../../services/recetas pasos/recetas-pasos.service';
import { ActivatedRoute } from '@angular/router';
import { RecetasService } from '../../services/recetas/recetas.service';
import { URL_IMGS } from 'src/environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RecetasReseniasService } from '../../services/recetas resenias/recetas-resenias.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { RecetasFavoritosService } from 'src/app/services/recetas favoritos/recetas-favoritos.service';
import { CarritoService } from '../../services/carrito/carrito.service';
import { element } from 'protractor';

@Component({
  selector: 'app-receta',
  templateUrl: './receta.component.html',
  styleUrls: ['./receta.component.css'],
})
export class RecetaComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  url: string = `${URL_IMGS}recetas/`;
  url_p: string = `${URL_IMGS}productos/`;
  url_u: string = `${URL_IMGS}usuarios/`;
  form: FormGroup;
  _valoracion: number = 0;
  _valoracion_usuario: number = 0;
  _receta: any;
  _resenia: any = { resenia: '', titulo: '', fecha: new Date(), valoracion: 0 };
  _pasos: any[] = [];
  _ingredientes: any[] = [];
  _resenias: any[] = [];
  _productos: any = [];
  favorito: any;
  _isFavorito: boolean = false;
  _conteo: number = 0;
  constructor(
    private _recetasService: RecetasService,
    private _recetasIngredientesService: RecetasIngredientesService,
    private _recetasPasosService: RecetasPasosService,
    private _recetasReseniasService: RecetasReseniasService,
    private _usuarioService: UsuariosService,
    private _recetaFavoritoService: RecetasFavoritosService,
    private _carritoService: CarritoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      resenia: new FormControl(null, [Validators.required]),
    });
    this.getReceta();
  }

  getReceta() {
    this._recetasService
      .getOne(this.route.snapshot.params.receta)
      .subscribe((res: any) => {
        this._receta = { ...res.recetas };
        this.getIngredientes();
        this.getPasos();
        this.getResenias();
        this.isfavorito();
        this.getFavoritos();
      });
  }
  getIngredientes() {
    this._recetasIngredientesService
      .get(this.route.snapshot.params.receta)
      .subscribe((res: any) => {
        this._ingredientes = [...res.recetas_ingredientes];
        this._ingredientes = this._ingredientes.map((element: any) => ({
          ...element,
          check: true,
        }));
      });
  }
  getPasos() {
    this._recetasPasosService
      .get(this.route.snapshot.params.receta)
      .subscribe((res: any) => {
        this._pasos = [...res.recetas_pasos];
      });
  }
  setValoracionUsuario(valoracion: number) {
    this._valoracion_usuario = valoracion;
  }
  insertResenia() {
    if (
      this._resenia.resenia != '' &&
      this._resenia.titulo != '' &&
      this._usuarioService.usuario &&
      this._usuarioService.usuario._id
    ) {
      this._recetasReseniasService
        .insert({
          ...this._resenia,
          receta: this._receta._id,
          valoracion: this._valoracion_usuario,
          usuario: this._usuarioService.usuario._id,
        })
        .subscribe(
          (res: any) => {
            this._recetasService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Reseña agregada correctamente'
            );
            this.getResenias();
            this._resenia = { titulo: '', resenia: '', valoracion: 0 };
          },
          (err: any) => {},
          () => {}
        );
    } else {
      this._usuarioService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Revisa que todos lo datos esten llenos o inicia sesion'
      );
    }
  }
  getResenias() {
    this._recetasReseniasService.get(this._receta._id).subscribe((res: any) => {
      this._resenias = res.recetas_resenias;
      this._valoracion = 0;
      this._resenias.forEach(
        (element) => (this._valoracion += element.valoracion)
      );
      if (this._valoracion > 0) {
        this._valoracion /= this._resenias.length;
        this._valoracion = Math.round(this._valoracion);
      }
    });
  }
  isfavorito() {
    if (this._usuarioService.usuario && this._usuarioService.usuario._id) {
      this._recetaFavoritoService
        .getFavorito(this._receta._id, this._usuarioService.usuario._id)
        .subscribe((res: any) => {
          if (res.favorito && res.favorito._id) {
            this._isFavorito = true;
            this.favorito = res.favorito;
          } else {
            this._isFavorito = false;
          }
        });
    }
  }

  getFavoritos() {
    this._recetaFavoritoService
      .getFavoritoReceta(this._receta._id)
      .subscribe((res: any) => {
        this._conteo = res.total;
      });
  }
  addfavorito() {
    console.log(this._usuarioService.usuario);
    if (this._usuarioService.usuario && this._usuarioService.usuario._id) {
      if (!this._isFavorito) {
        this.blockUI.start();
        this._recetaFavoritoService
          .insert({
            receta: this._receta._id,
            usuario: this._usuarioService.usuario._id,
          })
          .subscribe(
            (res: any) => {
              this.isfavorito();
            },
            (error: any) => {},
            () => {
              this.blockUI.stop();
            }
          );
      } else {
        this.blockUI.start();
        this._recetaFavoritoService.delete(this.favorito._id).subscribe(
          (res: any) => {
            this.isfavorito();
          },
          (error: any) => {},
          () => {
            this.blockUI.stop();
          }
        );
      }
    } else {
      this._recetaFavoritoService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'Inicia sesión para realizar esta acción'
      );
    }
  }
  addCarrito(_producto: any, _paquete: any) {
    if (_paquete) {
      if (_producto.status != 'Agotado') {
        this._carritoService.agregarAlCarrito(_producto, 1, _paquete);
      } else {
        this._recetasService._toastService.showNotification(
          'top',
          'center',
          'warning',
          'Este producto se encuentra agotado'
        );
      }
    } else {
      this._recetasService._toastService.showNotification(
        'top',
        'center',
        'warning',
        'El paquete para este producto no ha sido asignado por el administrador'
      );
    }
  }
  addAllCarrito() {
    this._ingredientes.forEach((ingrediente: any, index: number) => {
      console.log(ingrediente);
      setTimeout(() => {
        if (ingrediente.producto.status != 'Agotado') {
          if (ingrediente.check) {
            this._carritoService.agregarAlCarrito(
              ingrediente.producto,
              1,
              ingrediente.paquete
            );
          }
        } else {
          this._recetasService._toastService.showNotification(
            'top',
            'center',
            'warning',
            `El producto ${ingrediente.producto.nombre} se encuentra agotado`
          );
        }
      }, 1000 * index);
    });
  }
}
