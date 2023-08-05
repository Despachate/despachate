import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RecetasIngredientesService } from '../../../services/recetas ingredientes/recetas-ingredientes.service';
import { ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../services/productos/productos.service';
import { URL_IMGS } from 'environments/environment';
import { InventarioService } from '../../../services/inventario/inventario.service';

declare var $;

@Component({
  selector: 'app-recetas-ingredientes',
  templateUrl: './recetas-ingredientes.component.html',
  styleUrls: ['./recetas-ingredientes.component.css'],
})
export class RecetasIngredientesComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  categorias_ingredientes: string[] = ['FRESCO DESTACADO', 'DESTACADO'];

  public lista: any[] = [];
  public listaDepartamentos: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;
  receta_nombre = this.route.snapshot.params.receta_nombre;
  url = `${URL_IMGS}productos/`;

  ingredientes: any = {};
  productos: any[] = [];
  producto: any;
  paquetes: any[] = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _ingredientesService: RecetasIngredientesService,
    private _productosService: ProductosService,
    private _inventariosService: InventarioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      ingrediente: new FormControl(null, [Validators.required]),
      cantidad_medida: new FormControl(null, [Validators.required]),
      producto: new FormControl(null, [Validators.required]),
      paquete: new FormControl(null, [Validators.required]),
    });
    this.consultarDatos(true);
  }
  consultarProductos() {
    this._productosService
      .getWithFiltros({ search: this.form.controls.producto.value })
      .subscribe((res: any) => {
        this.productos = res.productos;
      });
  }
  setProducto(producto: any) {
    this.producto = { ...producto };
    this.form.controls.producto.setValue(this.producto.nombre);
    this.getPaquetes(this.producto._id);
  }

  getPaquetes(id: string) {
    this._inventariosService.getById(id).subscribe((res: any) => {
      this.paquetes = res.inventario;
    });
  }
  consultarDatos(flag = false) {
    // console.log(this.route.snapshot.params.receta);
    this._ingredientesService
      .get(this.route.snapshot.params.receta)
      .subscribe((res: any) => {
        console.log(res);
        this.lista = res.recetas_ingredientes;
        if (!flag) {
          this.rerender();
        } else {
          this.dtTrigger.next();
        }
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
  add() {
    if (this.form.valid && this.producto) {
      let temp = {
        ...this.form.value,
        producto: this.producto._id,
        receta: this.route.snapshot.params.receta,
      };
      console.log(temp);
      if (this.ingredientes._id) {
        this._ingredientesService
          .update(this.ingredientes._id, temp)
          .subscribe((res: any) => {
            this._ingredientesService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Ingrediente actualizado correctamente'
            );
            this.limpiarCampos();
          });
      } else {
        this._ingredientesService.insert(temp).subscribe((res: any) => {
          this._ingredientesService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Ingrediente guardado correctamente'
          );
          this.blockUI.start();
          this.blockUI.stop();
          this.limpiarCampos();
        });
      }
    } else {
      this._ingredientesService._toastService.showNotification(
        'top',
        'center',
        'danger',
        'Formulario invalido, llena todos los campos'
      );
      console.log(this.form.controls);
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if (!element.valid) {
            console.log(element);
            if (element.errors.required) {
              this._ingredientesService._toastService.showNotification(
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
  async update(index, flag = false) {
    if (flag) {
      this.enableCampos();
    }
    window.scrollTo(0, 0);
    this.ingredientes = this.lista[index];
    let response = await this._inventariosService
      .getById(this.ingredientes.producto._id)
      .toPromise();
    this.paquetes = response.inventario;
    this.form.setValue({
      ingrediente: this.ingredientes.ingrediente,
      cantidad_medida: this.ingredientes.cantidad_medida,
      producto: this.ingredientes.producto.nombre,
      categoria_ingrediente: this.ingredientes.categoria_ingrediente,
      paquete: this.ingredientes.paquete ? this.ingredientes.paquete._id : null,
    });
    this.productos = [this.ingredientes.producto];
    this.producto = this.ingredientes.producto;
    $('#header-form').collapse('show');
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
          this._ingredientesService.delete(id).subscribe((res: any) => {
            this._ingredientesService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Ingrediente eliminado correctamente'
            );
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
  disableCampos() {
    this.hidden = true;
    for (const key in this.form.controls) {
      if (Object.prototype.hasOwnProperty.call(this.form.controls, key)) {
        const element = this.form.controls[key];
        element.disable();
      }
    }
  }
  enableCampos() {
    this.hidden = false;
    for (const key in this.form.controls) {
      if (Object.prototype.hasOwnProperty.call(this.form.controls, key)) {
        const element = this.form.controls[key];
        element.enable();
      }
    }
  }
  limpiarCampos() {
    this.form.setValue({
      ingrediente: null,
      cantidad_medida: null,
      producto: null,
      paquete: null,
    });
    this.producto = undefined;
    $('#header-form').collapse('toggle');
    this.ingredientes = {};
    this.productos = [];
    this.paquetes = [];
    this.consultarDatos();
    this.enableCampos();
  }
}
