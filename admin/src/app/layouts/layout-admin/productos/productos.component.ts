import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { URL_IMGS } from '../../../../environments/environment';
// import * as $ from "jquery";
import { ProductosService } from '../../../services/productos/productos.service';
import { DepartamentosService } from '../../../services/departamentos/departamentos.service';
import { SubcategoriasService } from '../../../services/subcategorias/subcategorias.service';
import { CategoriasService } from '../../../services/categorias/categorias.service';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { SubirArchivosService } from '../../../services/subir-archivos/subir-archivos.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PaginadorService } from '../../../services/paginador.service';
import * as XLSX from 'xlsx';

declare var $;
@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})
export class ProductosComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  // imagenes
  public imagenSubir: File;
  public imagenTemp: any = null;
  public archivos: any[] = [];
  public archivosSubir: any[] = [];
  public excelSubir: any[] = [];
  public imgEditar = '';
  public url = `${URL_IMGS}productos/`;

  public lista: any[] = [];
  public listaDepartamentos: any[] = [];
  public listaCategorias: any[] = [];
  public listaSubCategorias: any[] = [];
  public listaExcel: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  public producto: any = {};

  public params = {
    order: 'nombre',
    order_direction: 1,
    pagina: 1,
    search: '',
  };
  public paginas = [];
  public last_page: number = 1;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _productoService: ProductosService,
    private _categoriaService: CategoriasService,
    private _subCategoriaService: SubcategoriasService,
    private _departamentoService: DepartamentosService,
    private _subirArchivos: SubirArchivosService,
    private router: Router,
    public _paginador: PaginadorService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      descripcion: new FormControl(null, Validators.required),
      etiqueta: new FormControl(null, Validators.required),
      departamento: new FormControl(null, [
        Validators.required,
        Validators.nullValidator,
      ]),
      categoria: new FormControl(null, [
        Validators.required,
        Validators.nullValidator,
      ]),
      subcategoria: new FormControl(null, [
        Validators.required,
        Validators.nullValidator,
      ]),
      sku: new FormControl(null, Validators.required),
      estiloVida: new FormControl(null, Validators.required),
      resumenBreve: new FormControl(null, Validators.required),
      peso: new FormControl(null, Validators.required),
      medida: new FormControl(null, Validators.required),
      status: new FormControl('En stock', Validators.required),
      img: new FormControl(null),
    });
    this.consultarDatos(true);
    this.consultarCampos();
  }
  consultarCampos() {
    this._departamentoService.get().subscribe((res: any) => {
      this.listaDepartamentos = res.departamentos;
    });
  }
  consultarCategorias(dptoId) {
    console.log(dptoId);
    if (dptoId === 'null') {
      return false;
    }
    this._categoriaService.getCatXDpto(dptoId).subscribe((res: any) => {
      this.listaCategorias = res.categorias;
    });
  }
  consultarSubcategorias(catId) {
    if (catId === 'null') {
      return false;
    }
    this._subCategoriaService.getScatXCat(catId).subscribe((res: any) => {
      this.listaSubCategorias = res.subcategorias;
    });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      // setTimeout(() => {
      this.dtTrigger.next();
      // }, 1000);
    });
  }

  consultarDatos(flag = false) {
    this._productoService.getCompiled(this.params).subscribe((res: any) => {
      console.log(res);
      this.lista = res.productos;
      // this._paginador.init(this.lista, 100);
      let show_only = res.total_paginas > 10 ? 10 : this.lista.length;
      let end = this.params.pagina + 5;
      let start =
        this.params.pagina > 5
          ? this.params.pagina - 6
          : this.params.pagina - (5 - (5 - this.params.pagina));

      this.last_page = res.total_paginas;
      this.paginas = new Array(res.total_paginas)
        .fill(1)
        .map((v, i) => i + 1)
        .slice(start, end);
      console.log(this.paginas);
      // if (!flag) {
      //   this.rerender();
      // } else {
      //   this.dtTrigger.next();
      // }
    });
  }
  cambiarpagina(pagina) {
    this.params.pagina = pagina;
    this.consultarDatos();
    // flag
    //   ? this._paginador.goTo(this._paginador.index + this._paginador.num)
    //   : this._paginador.goTo(this._paginador.index - this._paginador.num);
    // this.rerender();
  }

  changeOrder(order) {
    this.params.order = order;
    this.params.order_direction = this.params.order_direction === 1 ? -1 : 1;
    this.consultarDatos();
  }

  add() {
    if (this.form.valid) {
      if (this.producto._id) {
        let productoTemp = this.form.value;
        productoTemp.img = this.producto.img;
        // if(!!this.producto.es_favorito) {
        //   productoTemp.es_favorito = this.producto.es_favorito;
        // } else productoTemp.es_favorito = 'no';
        console.log('producto a insertar', productoTemp);
        this._productoService
          .update(this.producto._id, productoTemp)
          .subscribe((res: any) => {
            console.log(res);
            this._productoService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Producto actualizado correctamente'
            );
            if (this.archivosSubir.length > 0) {
              this.blockUI.start();
              this._subirArchivos
                .subirArchivo(
                  this.archivosSubir,
                  'productos',
                  this.producto._id
                )
                .then((res: any) => {
                  this.limpiarCampos();
                  // this.consultarDatos();
                });
            } else {
              this.limpiarCampos();
            }
          });
      } else {
        if (this.archivosSubir.length > 0) {
          let productoTemp = this.form.value
          productoTemp.es_favorito = 'no'
          this._productoService
            .insert(productoTemp)
            .subscribe((res: any) => {
              this._productoService._toastService.showNotification(
                'top',
                'center',
                'success',
                'Producto guardado correctamente'
              );
              this._subirArchivos
                .subirArchivo(this.archivosSubir, 'productos', res.producto._id)
                .then((res: any) => {
                  this.limpiarCampos();
                  // this.consultarDatos();
                });
            });
        } else {
          this._productoService._toastService.showNotification(
            'top',
            'center',
            'danger',
            'No se selecciono una imagen'
          );
        }
      }
    } else {
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'danger',
        'Formulario invalido, llena todos los campos'
      );
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if (!element.valid) {
            console.log(element);
            if (element.errors.required) {
              this._productoService._toastService.showNotification(
                'top',
                'center',
                'danger',
                `El campo ${key} es requerido`
              );
            }
          }
        }
      }
    }
  }
  update(index, flag = false) {
    window.scroll(0, 0);
    this.producto = [];
    if (flag) {
      this.enableCampos();
    }
    this.producto = this.lista[index];
    this._categoriaService
      .getCatXDpto(this.producto.departamento._id)
      .subscribe((res: any) => {
        this.listaCategorias = res.categorias;
        this._subCategoriaService
          .getScatXCat(this.producto.categoria._id)
          .subscribe((res: any) => {
            this.listaSubCategorias = res.subcategorias;
            this.imgEditar = this.producto.img;
            console.log(this.producto);
            console.log(this.listaSubCategorias);
            setTimeout(() => {
              this.form.setValue({
                nombre: this.producto.nombre,
                descripcion: this.producto.descripcion,
                etiqueta: this.producto.etiqueta,
                departamento: this.producto.departamento._id,
                categoria: this.producto.categoria._id,
                subcategoria: !!this.producto.subcategoria ? this.producto.subcategoria?._id : null,
                sku: this.producto.sku,
                estiloVida: this.producto.estiloVida
                  ? this.producto.estiloVida
                  : null,
                resumenBreve: this.producto.resumenBreve,
                peso: this.producto.peso,
                medida: this.producto.medida,
                status: this.producto.status,
                img: null,
              });
            }, 1000);
            $('#header-form').collapse('show');
          });
      });
  }
  delete(id) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro?',
        text: 'Esta acción no es reversible!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, eliminar!',
        cancelButtonText: 'No, cancelar!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          this._productoService.delete(id).subscribe((res: any) => {
            this._productoService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Producto eliminado correctamente'
            );
            this.producto = {};
            this.consultarDatos();
          });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelado',
            'Tu registro se encuentra seguro :)',
            'error'
          );
        }
      });
  }

  ver(index) {
    this.disableCampos();
    this.update(index);
  }
  seleccionImage(archivo: File) {
    this.imgEditar = '';
    const reader = new FileReader();
    const urlImagenTemp = reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      this.imagenTemp = reader.result;
      this.archivos = [reader.result];
      this.archivosSubir = [archivo];
    };
  }
  seleccionExcel(archivo: File) {
    if (archivo !== null || !archivo) {
      this.excelSubir = [archivo];
      this.blockUI.start();
      this._subirArchivos
        .subirArchivo(this.excelSubir, 'exceles', '0')
        .then((res: any) => {
          console.log(res);
          this.listaExcel = res.worksheet[0];
          console.log(this.listaExcel);
          $('#excelTable').modal('show');
        });
    }
  }
  disableCampos() {
    this.hidden = true;
    this.form.get('nombre').disable();
    this.form.get('descripcion').disable();
    this.form.get('etiqueta').disable();
    this.form.get('departamento').disable();
    this.form.get('categoria').disable();
    this.form.get('subcategoria').disable();
    this.form.get('estiloVida').disable();
    this.form.get('sku').disable();
    this.form.get('resumenBreve').disable();
    this.form.get('peso').disable();
    this.form.get('medida').disable();
    this.form.get('status').disable();
    this.form.get('img').disable();
  }
  enableCampos() {
    this.hidden = false;
    this.form.get('nombre').enable();
    this.form.get('descripcion').enable();
    this.form.get('etiqueta').enable();
    this.form.get('departamento').enable();
    this.form.get('categoria').enable();
    this.form.get('subcategoria').enable();
    this.form.get('estiloVida').enable();
    this.form.get('sku').enable();
    this.form.get('resumenBreve').enable();
    this.form.get('peso').enable();
    this.form.get('medida').enable();
    this.form.get('status').enable();
    this.form.get('img').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      nombre: null,
      descripcion: null,
      etiqueta: null,
      departamento: null,
      categoria: null,
      subcategoria: null,
      sku: null,
      estiloVida: null,
      resumenBreve: null,
      peso: null,
      medida: null,
      status: 'En stock',
      img: null,
    });
    this.imgEditar = '';
    this.imagenTemp = null;
    this.archivosSubir = [];
    this.producto = {};
    $('#header-form').collapse('toggle');
    window.scrollTo(0, 0);
    this.listaCategorias = null;
    this.listaSubCategorias = null;
    this.enableCampos();
    this.consultarDatos();
  }
  excel(productos = this.listaExcel) {
    $('#excelTable').modal('hide');
    this._productoService.insertMany(productos).subscribe((res: any) => {
      console.log(res);
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'success',
        'Productos guardados correctamente'
      );
      this.consultarDatos();
      this.listaExcel = [];
    });
  }
  inventario(idProducto) {
    this.router.navigate([`/admin/inventario/${idProducto}`]);
  }

  async generateExcel() {
    let json = await this._productoService.getCompiled2().toPromise();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json.productos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'resumen_productos_inventarios.xlsx');
  }

  duplicar(idProducto: string) {
    this._productoService.duplicar(idProducto).subscribe((res: any) => {
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'success',
        'Producto duplicado correctamente'
      );
      this.consultarDatos();
    });
  }

  ocultar(idProducto: string) {
    this._productoService.ocultar(idProducto).subscribe((res: any) => {
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'success',
        'Producto ocultado correctamente'
      );
      this.consultarDatos();
    });
  }

  adm_favoritos(idProducto: string) {
    this._productoService.adm_favoritos(idProducto).subscribe((res: any) => {
      this._productoService._toastService.showNotification(
        'top',
        'center',
        'success',
        'Producto editado correctamente'
      );
      this.consultarDatos();
    });
  }
}
