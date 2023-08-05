import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { ProductosService } from '../../../services/productos/productos.service';
import { ToastService } from '../../../services/toast/toast.service';
import { OfertasService } from '../../../services/ofertas/ofertas.service';
import { InventarioService } from '../../../services/inventario/inventario.service';
declare var $;
@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css'],
})
export class OfertasComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public lista: any[] = [];
  public listaProductos: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;
  public listaInventario: any[] = [];
  oferta: any = {};

  public search: string = '';

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  constructor(
    private _productoService: ProductosService,
    private _ofertaService: OfertasService,
    private _toastService: ToastService,
    private _inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      producto: new FormControl(null, Validators.required),
      precio: new FormControl(null, Validators.required),
      inventario: new FormControl(null, Validators.required),
    });
    this.consultarDatos(true);
    this.consultarProductos();
  }
  consultarProductos() {
    this._productoService
      .getCompiled({ search: this.search })
      .subscribe((res: any) => {
        this.listaProductos = res.productos;
      });
  }
  consultarDatos(flag = false) {
    this._ofertaService.get().subscribe((res: any) => {
      this.lista = res.ofertas;
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
    if (this.form.valid) {
      if (this.oferta._id) {
        this._ofertaService
          .update(this.oferta._id, this.form.value)
          .subscribe((res: any) => {
            this._ofertaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Oferta actualizada correctamente'
            );
            this.limpiarCampos();
          });
      } else {
        this._ofertaService.insert(this.form.value).subscribe((res: any) => {
          this._ofertaService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Oferta guardada correctamente'
          );

          this.limpiarCampos();
        });
      }
    } else {
      this._ofertaService._toastService.showNotification(
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
              this._ofertaService._toastService.showNotification(
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
    if (flag) {
      this.enableCampos();
    }
    this.oferta = this.lista[index];

    this.form.get('producto').setValue(this.oferta.producto._id);
    this.productoSeleccionado(this.oferta.producto._id);
    this.form.get('precio').setValue(this.oferta.precio);
    this.form.get('inventario').setValue(this.oferta.inventario);
    // this.disableCampos();
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
          this._ofertaService.delete(id).subscribe((res: any) => {
            this._ofertaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Oferta eliminada correctamente'
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
    this.form.get('producto').disable();
    this.form.get('precio').disable();
    this.form.get('inventario').disable();
  }
  enableCampos() {
    this.hidden = false;
    this.form.get('producto').enable();
    this.form.get('precio').enable();
    this.form.get('inventario').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      precio: null,
      producto: null,
      inventario: null,
    });
    $('#header-form').collapse('toggle');
    this.oferta = {};
    this.consultarDatos();
    this.enableCampos();
  }
  productoSeleccionado(idProducto) {
    this.form.controls.producto.setValue(idProducto);
    console.log(this.form.controls.producto.value === idProducto);
    this._inventarioService.getById(idProducto).subscribe((res: any) => {
      console.log(res);
      this.listaInventario = res.inventario;
    });
  }

  consultarInventario(idInventario) {
    let datosInventario: any[] = [];
    this._inventarioService.getById(idInventario).subscribe((res: any) => {
      console.log(res);
      datosInventario = res.inventario;
    });
    return datosInventario;
  }
}
