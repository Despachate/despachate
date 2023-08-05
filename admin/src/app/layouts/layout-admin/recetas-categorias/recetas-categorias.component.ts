import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RecetasCategoriasService } from '../../../services/recetas categorias/recetas-categorias.service';

declare var $;

@Component({
  selector: 'app-recetas-categorias',
  templateUrl: './recetas-categorias.component.html',
  styleUrls: ['./recetas-categorias.component.css'],
})
export class RecetasCategoriasComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  public lista: any[] = [];
  public listaDepartamentos: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  categoria: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(private _categoriaService: RecetasCategoriasService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
    });
    this.consultarDatos(true);
  }
  consultarDatos(flag = false) {
    this._categoriaService.get().subscribe((res: any) => {
      console.log(res);
      this.lista = res.recetas_categoria;
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
      if (this.categoria._id) {
        this._categoriaService
          .update(this.categoria._id, this.form.value)
          .subscribe((res: any) => {
            this._categoriaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Categoria actualizada correctamente'
            );
            this.limpiarCampos();
          });
      } else {
        this._categoriaService.insert(this.form.value).subscribe((res: any) => {
          this._categoriaService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Categoria guardada correctamente'
          );
          this.blockUI.start();
          this.blockUI.stop();
          this.limpiarCampos();
        });
      }
    } else {
      this._categoriaService._toastService.showNotification(
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
              this._categoriaService._toastService.showNotification(
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
    if (flag) {
      this.enableCampos();
    }
    window.scrollTo(0, 0);
    this.categoria = this.lista[index];
    this.form.setValue({
      nombre: this.categoria.nombre,
    });
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
          this._categoriaService.delete(id).subscribe((res: any) => {
            this._categoriaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Categoria eliminada correctamente'
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
    this.form.get('nombre').disable();
  }
  enableCampos() {
    this.hidden = false;
    this.form.get('nombre').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      nombre: null,
    });
    $('#header-form').collapse('toggle');
    this.categoria = {};
    this.consultarDatos();
    this.enableCampos();
  }
}
