import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DepartamentosService } from '../../../services/departamentos/departamentos.service';
import { CategoriasService } from '../../../services/categorias/categorias.service';
import { SubcategoriasService } from '../../../services/subcategorias/subcategorias.service';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { Router } from '@angular/router';
import { ProductosService } from '../../../services/productos/productos.service';
import { CarritoService } from '../../../services/carrito/carrito.service';
import { PaginadorService } from '../../../services/paginador.service';
import { RecetasCategoriasService } from '../../../services/recetas categorias/recetas-categorias.service';
declare var UIkit;
declare var $;
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @ViewChild('dropDown') dropDown: ElementRef;
  listaDepartamentos: any[] = [];
  listaCategorias: any[] = [];
  listaSubcategorias: any[] = new Array();
  _menu = [];

  listaCategoriasRecetas: any[] = [];

  terminoBusqueda: string = '';
  Listaproductos: any[] = [];
  hints: any[] = [];

  prodEncontrados = false;
  l5Deptos: any[] = [];
  sesion: boolean = false;
  showModal: boolean = false;

  constructor(
    private _departamentoService: DepartamentosService,
    private _categoriaService: CategoriasService,
    private _subcategoriaService: SubcategoriasService,
    private _recetasCategoriasService: RecetasCategoriasService,
    public _usuarioService: UsuariosService,
    private _productoService: ProductosService,
    private router: Router,
    public _carritoService: CarritoService,
    public _paginado: PaginadorService
  ) {}
  ngOnInit(): void {
    this.router.events.subscribe((res: any) => {
      let logueado = this._usuarioService.estaLogueado();
      if (logueado) {
        this.sesion = true;
      } else {
        this.sesion = false;
      }
      $('#mdlProductos').modal('hide');
    });
    this._departamentoService.getMenuXDptos().subscribe((res: any) => {
      this._menu = res.menu;
    });
    this._recetasCategoriasService.get().subscribe((res: any) => {
      this.listaCategoriasRecetas = res.recetas_categoria;
    });
  }

  cerrarSesion() {
    this._carritoService.limpiarStorage();
    this._usuarioService.logout();
  }
  cerrarDropDown(dropDown: any) {
    UIkit.dropdown(dropDown).hide();
  }

  Buscar() {
    this.router.navigate(['/catalogo'], {
      queryParams: { search: this.terminoBusqueda },
    });
  }
  getHint() {
    this._productoService
      .getHintsByTermino(this.terminoBusqueda)
      .subscribe((res: any) => {
        this.hints = res.productos;
      });
  }
}
