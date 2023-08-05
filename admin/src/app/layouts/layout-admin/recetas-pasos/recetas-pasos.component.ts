import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RecetasPasosService } from '../../../services/recetas pasos/recetas-pasos.service';
import { ActivatedRoute } from '@angular/router';
declare var $;
@Component({
  selector: 'app-recetas-pasos',
  templateUrl: './recetas-pasos.component.html',
  styleUrls: ['./recetas-pasos.component.css'],
})
export class RecetasPasosComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  public lista: any[] = [];
  public listaDepartamentos: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;
  receta_nombre = this.route.snapshot.params.receta_nombre;
  paso: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _recetasPasosService: RecetasPasosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      paso: new FormControl(null, [Validators.required]),
      descripcion: new FormControl(null, [Validators.required]),
    });
    this.consultarDatos(true);
  }
  consultarDatos(flag = false) {
    this._recetasPasosService
      .get(this.route.snapshot.params.receta)
      .subscribe((res: any) => {
        console.log(res);
        this.lista = res.recetas_pasos;
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
      let temp = {
        ...this.form.value,
        receta: this.route.snapshot.params.receta,
      };
      if (this.paso._id) {
        this._recetasPasosService
          .update(this.paso._id, temp)
          .subscribe((res: any) => {
            this._recetasPasosService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Categoria actualizada correctamente'
            );
            this.limpiarCampos();
          });
      } else {
        this._recetasPasosService.insert(temp).subscribe((res: any) => {
          this._recetasPasosService._toastService.showNotification(
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
      this._recetasPasosService._toastService.showNotification(
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
              this._recetasPasosService._toastService.showNotification(
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
    this.paso = this.lista[index];
    this.form.setValue({
      nombre: this.paso.nombre,
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
          this._recetasPasosService.delete(id).subscribe((res: any) => {
            this._recetasPasosService._toastService.showNotification(
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
    for (const key in this.form.controls) {
      if (Object.prototype.hasOwnProperty.call(this.form.controls, key)) {
        const element = this.form.controls[key];
        element.setValue(null);
      }
    }
    $('#header-form').collapse('toggle');
    this.paso = {};
    this.consultarDatos();
    this.enableCampos();
  }
}
