import { Component, Input, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { URL_IMGS } from 'src/environments/environment';
import { RecetasFavoritosService } from '../../services/recetas favoritos/recetas-favoritos.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { RecetasReseniasService } from '../../services/recetas resenias/recetas-resenias.service';

@Component({
  selector: 'app-card-receta',
  templateUrl: './card-receta.component.html',
  styleUrls: ['./card-receta.component.css'],
})
export class CardRecetaComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  @Input('receta') _receta: any;
  url: string = `${URL_IMGS}recetas/`;
  favorito: any;
  _isFavorito: boolean = false;
  _valoracion: number = 0;
  constructor(
    private _recetaFavoritoService: RecetasFavoritosService,
    private _recetasReseniasService: RecetasReseniasService,
    private _usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.isfavorito();
    this.getResenias();
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
  getResenias() {
    this._recetasReseniasService.get(this._receta._id).subscribe((res: any) => {
      this._valoracion = 0;
      res.recetas_resenias.forEach(
        (element) => (this._valoracion += element.valoracion)
      );
      if (this._valoracion > 0) {
        this._valoracion /= res.recetas_resenias.length;
        this._valoracion = Math.round(this._valoracion);
      }
    });
  }
}
