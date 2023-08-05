import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ProductosService } from '../../services/productos/productos.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { CategoriasService } from '../../services/categorias/categorias.service';
import { SubcategoriasService } from '../../services/subcategorias/subcategorias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartamentosService } from '../../services/departamentos/departamentos.service';
import { InventarioService } from '../../services/inventario/inventario.service';
import { element } from 'protractor';
import { URL_IMGS } from 'src/environments/environment';
import { PaginadorService } from '../../services/paginador.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

declare var $;

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  img = `${URL_IMGS}departamentos/`;
  productos: any = [];
  filtros: any;
  menu: any[] = [];
  menuDepartamento: any;
  subtittle: string;
  pagina: number = 0;
  pagina_anterior: number = -1;
  total_paginas: number = 0;
  total_productos: number = 0;
  @ViewChild('Rango1') _rango1: ElementRef;
  @ViewChild('Rango2') _rango2: ElementRef;
  @ViewChild('Filtrar') _filtrar: ElementRef;
  rango1 = 5.0;
  rango2 = 1000.0;

  constructor(
    private _productoService: ProductosService,
    private _usuarioService: UsuariosService,
    private _categoriaService: CategoriasService,
    public _paginado: PaginadorService,
    private _subcategoriaService: SubcategoriasService,
    private _departamentoService: DepartamentosService,
    private _inventarioService: InventarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      console.log(params);
      this.filtros = params;
      this.productos = [];
      this.reinicializarPaginas();
      this.getMenuDepartamentos();
      this.getMenuDepartamento();
      this.getProductos();
      this.setSubtittle();
    });
  }

  setSubtittle() {
    if (this.route.snapshot.queryParams.subcategoria) {
      this._subcategoriaService
        .getOne(this.route.snapshot.queryParams.subcategoria)
        .subscribe((res: any) => {
          console.log(res);
          this.subtittle = res.subcategorias.nombre;
        });
    } else if (this.route.snapshot.queryParams.categoria) {
      this._categoriaService
        .getOne(this.route.snapshot.queryParams.categoria)
        .subscribe((res: any) => {
          console.log(res);
          this.subtittle = res.categorias.nombre;
        });
    } else if (this.route.snapshot.queryParams.search) {
      this.subtittle = this.route.snapshot.queryParams.search;
    }
  }

  validar(flag: boolean) {
    console.log('validar', this.rango1 + '-' + this.rango2);
    this.rango1 >= this.rango2 && flag
      ? (this.rango1 = this.rango2 - 25)
      : false;
    this.rango2 <= this.rango1 && !flag
      ? (this.rango2 = this.rango1 + 25)
      : false;
  }

  getMenuDepartamentos() {
    this._departamentoService.getMenuXDptos().subscribe((res: any) => {
      this.menu = res.menu;
      console.log('menu dptos', this.menu);
    });
  }

  getMenuDepartamento() {
    if (this.route.snapshot.queryParams.departamento) {
      this._departamentoService
        .getMenuXDpto(this.route.snapshot.queryParams.departamento)
        .subscribe((res: any) => {
          this.menuDepartamento = res.departamento;
          console.log('menu depto ', this.menuDepartamento);
        });
    }
  }

  getProductos() {
    console.log('pagina antes ', this.pagina);
    if (this.pagina != this.pagina_anterior) {
      this.pagina_anterior = this.pagina;
      this.blockUI.start();
      this._productoService
        .getWithFiltros({ ...this.filtros, limit: 15, pagina: this.pagina })
        .subscribe(
          (res: any) => {
            this.total_paginas = res.total_paginas;
            this.total_productos = res.total;
            if (res.total_paginas === 0) {
              this.productos = res.productos;
            } else if (this.pagina < res.total_paginas) {
              this.productos = this.productos.concat(res.productos);
              this.pagina = res.pagina_siguiente;
              console.log('pagina despues ', this.pagina);
            }
            console.log('productos', res);
          },
          (error: any) => {},
          () => {
            this.blockUI.stop();
          }
        );
    }
  }

  onScroll(event: any) {
    console.log('scroll', event);
    this.getProductos();
  }

  filtrarXPrecio() {
    this.router.navigate(['/catalogo'], {
      queryParams: {
        ...this.filtros,
        rango_sup: this.rango2,
        rango_inf: this.rango1,
      },
    });
  }

  filtrosEstiloVida(estiloVida: string) {
    // this.pagina = 0;
    return { ...this.filtros, estiloVida };
  }

  addFiltros(filtros: any) {
    // this.pagina = 0;
    return { ...this.filtros, ...filtros };
  }

  reinicializarPaginas() {
    this.pagina = 0;
    this.pagina_anterior = -1;
    this.total_paginas = 0;
    this.total_productos = 0;
  }
  scroll() {
    window.scrollTo(0, 0);
  }

  changeOrder(ordering: any = {}) {
    if (
      !!this.filtros.order &&
      ordering.order === this.filtros.order &&
      !!this.filtros.order_direction &&
      this.filtros.order_direction === 'ASC'
    ) {
      // alert('Entro if');
      ordering.order_direction = 'DESC';
    } else {
      // alert('Entro else');
    }
    this.filtros = { ...this.filtros, ...ordering };
    this.router.navigate(['/catalogo'], {
      queryParams: this.filtros,
    });
  }
}
