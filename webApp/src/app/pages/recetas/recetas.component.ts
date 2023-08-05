import { Component, OnInit } from '@angular/core';
import { RecetasService } from '../../services/recetas/recetas.service';
import { RecetasCategoriasService } from '../../services/recetas categorias/recetas-categorias.service';
import { Router, ActivatedRoute } from '@angular/router';
import { URL_IMGS } from 'src/environments/environment';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { NgBlockUI, BlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.css'],
})
export class RecetasComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  url: string = `${URL_IMGS}recetas/`;
  recetas: any[] = [];
  categorias: any[] = [];
  filtros: any = {};
  pagina: number = 0;
  total_paginas: number = 0;
  total_productos: number = 0;
  pagina_anterior: number = -1;
  constructor(
    private _recetasService: RecetasService,
    private _recetasCategoriasService: RecetasCategoriasService,
    private _usuarioService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.reset();
      if (params.categoria) {
        this.filtros = { categoria: params.categoria };
      }
      if (params.user) {
        if (
          !this._usuarioService.usuario ||
          this._usuarioService.usuario === null
        ) {
          this.router.navigate(['/login']);
        }
        this.filtros = { ...this.filtros, user: params.user };
      }
      this.getRecetas();
    });
    this.getCategorias();
    // this.getRecetas();
  }

  onScroll(event: any) {
    console.log('scroll', event);
   //  if(this.total_productos > this.recetas.length )
    this.getRecetas();
  }

  getRecetas() {
    console.log('pagina antes ', this.pagina);
    if (this.pagina != this.pagina_anterior) {
      this.pagina_anterior = this.pagina;
      this.blockUI.start();
      this._recetasService
        .getWithFiltros({ ...this.filtros, limit: 15, pagina: this.pagina })
        .subscribe(
          (res: any) => {
            // this.recetas = res.recetas;
            this.total_paginas = res.total_paginas;
            this.total_productos = res.total;
            if (res.total_paginas === 0) {
              this.recetas = res.recetas;
            } else if (this.pagina < res.total_paginas) {
              this.recetas = [...this.recetas, ...res.recetas];
              this.pagina = res.pagina_siguiente;
              console.log('pagina despues ', this.pagina);
            }
            console.log('productos', res);
          },
          (err) => console.log(err),
          () => {
            this.blockUI.stop();
          }
        );
    }

  }

  getCategorias() {
    this._recetasCategoriasService.get().subscribe((res: any) => {
      this.categorias = res.recetas_categoria;
    });
  }

  reset() {
    this.pagina = 0;
    this.total_paginas = 0;
    this.total_productos = 0;
    this.pagina_anterior = -1;
    this.recetas = [];
    this.filtros = {};
  }
}
