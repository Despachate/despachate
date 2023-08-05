import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { FavoritosService } from '../../services/favoritos/favoritos.service';
import { URL_IMGS } from 'src/environments/environment';
import { ToastService } from '../../services/toast/toast.service';
import { CategoriasService } from '../../services/categorias/categorias.service';
import { SubcategoriasService } from '../../services/subcategorias/subcategorias.service';
import { DepartamentosService } from '../../services/departamentos/departamentos.service';
import { InventarioService } from '../../services/inventario/inventario.service';
import { ProductosService } from '../../services/productos/productos.service';
@Component({
  selector: 'app-mis-favoritos',
  templateUrl: './mis-favoritos.component.html',
  styleUrls: ['./mis-favoritos.component.css'],
})
export class MisFavoritosComponent implements OnInit {
  allFavoritos: any[] = [];
  listaFavoritos: any[] = [];
  datosUsuario: any[] = [];
  url: string = `${URL_IMGS}productos/`;
  lDepartamentos: any[] = [];
  lCategorias: any[] = [];
  lSubcategorias: any[] = new Array();
  _menu = [];
  departamento: string = '';
  departamento_id: string = '';
  listaProductosFiltrados: any[] = [];
  @ViewChild('Rango1') _rango1: ElementRef;
  @ViewChild('Rango2') _rango2: ElementRef;
  @ViewChild('Filtrar') _filtrar: ElementRef;
  rango1 = 5.0;
  rango2 = 500.0;
  constructor(
    private router: Router,
    private _usuarioService: UsuariosService,
    private _favoritoService: FavoritosService,
    private _categoriaService: CategoriasService,
    private _subcategoriaService: SubcategoriasService,
    private _departamentoService: DepartamentosService,
    private _inventarioService: InventarioService,
    private _productoService: ProductosService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.datosUsuario.push(JSON.parse(localStorage.getItem('usuario')));
    this.obtenerFavoritos();
    this.obtenerDepartamentos();
    this.cargarDatosDCS();
  }
  obtenerDepartamentos() {
    this._departamentoService.get().subscribe((res: any) => {
      this.lDepartamentos = res.departamentos;
      return this.lDepartamentos;
    });
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
  cargarDatosDCS() {
    this._departamentoService.get().subscribe((res1: any) => {
      this._categoriaService.get().subscribe((res2: any) => {
        this._subcategoriaService.get().subscribe((res3: any) => {
          let menu = [];
          for (let index = 0; index < res1.departamentos.length; index++) {
            let categoria = [];
            for (let index1 = 0; index1 < res2.categorias.length; index1++) {
              if (
                res1.departamentos[index]._id ==
                res2.categorias[index1].departamento._id
              ) {
                this.lCategorias.push(res2.categorias[index1]);
                categoria.push(res2.categorias[index1]);
              }
            }
            if (categoria.length > 0) {
              menu.push(categoria);
            }
          }
          this._menu = menu;
          for (let index = 0; index < res2.categorias.length; index++) {
            let subcategoria = [];
            for (let index1 = 0; index1 < res3.subcategorias.length; index1++) {
              if (res3.subcategorias[index1].categoria != null) {
                if (
                  res2.categorias[index]._id ==
                  res3.subcategorias[index1].categoria._id
                ) {
                  subcategoria.push(res3.subcategorias[index1]);
                }
              }
            }
            this.lSubcategorias[res2.categorias[index]._id] = subcategoria;
          }
        });
      });
    });
  }
  obtenerFavoritos() {
    this._favoritoService
      .get(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        this.listaFavoritos = res.favoritos.filter(
          (favorito: any) => !!favorito.producto
        );
        this.allFavoritos = res.favoritos.filter(
          (favorito: any) => !!favorito.producto
        );
        res.favoritos
          .filter((favorito: any) => !favorito.producto)
          .forEach((favorito: any) => {
            this._favoritoService.delete(favorito._id).subscribe((res: any) => {
              this._favoritoService._toastService.showNotification(
                'top',
                'center',
                'warning',
                'Se ha quitado un favorito por que el producto fue eliminado'
              );
            });
          });
        console.log(res.favoritos);
      });
  }
  cerrarSesion() {
    this._usuarioService.logout();
  }
  filtrarProductos(idSubcat) {
    // let idsProductos: any[] = [];
    // console.log('id subcategoria', idSubcat);
    // this._productoService.getByIdSubcat(idSubcat).subscribe((res: any) => {
    //   this.listaProductosFiltrados = res.productos;
    //   console.log('prdocutos filtrados por subcategoria');
    //   console.log(this.listaProductosFiltrados);
    //   for (
    //     let index = 0;
    //     index < this.listaProductosFiltrados.length;
    //     index++
    //   ) {
    //     idsProductos.push(this.listaProductosFiltrados[index]._id);
    //   }
    //   console.log('idsProductos', idsProductos);
    //   this._favoritoService
    //     .getProdFavoritos(idsProductos)
    //     .subscribe((res2: any) => {
    //       this.listaFavoritos = [];
    //       console.log('favoritos filtrados', res2);
    //       this.listaFavoritos = res2.favoritos;
    //     });
    // });
    this.listaFavoritos = this.allFavoritos.filter(
      (favorito: any) => favorito.producto.subcategoria === idSubcat
    );
  }
  filtarXPrecio() {
    let idsProductos: any[] = [];
    this._favoritoService
      .get(this.datosUsuario[0]._id)
      .subscribe((res: any) => {
        for (let index = 0; index < res.favoritos.length; index++) {
          idsProductos.push(res.favoritos[index].producto._id);
        }
        let rangoPrecios =
          this._rango1.nativeElement.value +
          '-' +
          this._rango2.nativeElement.value;
        this._inventarioService
          .getByIdPrecio(rangoPrecios, idsProductos)
          .subscribe((res: any) => {
            this.listaFavoritos = [];
            res.productos.forEach((element) => {
              this.listaFavoritos.push({ producto: element });
            });
          });
      });
  }
  /*     actualizarRango(){
      if(this._rango1.nativeElement.value>this._rango2.nativeElement.value){
        this._rango1.nativeElement.value = Number(this._rango2.nativeElement.value)-1 ;
        this.toastService.showNotification("top","center","warning","Se invirtieron los rangos");
      }

    } */
}
