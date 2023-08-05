import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { DepartamentosService } from 'app/services/departamentos/departamentos.service';
import { SubirArchivosService } from 'app/services/subir-archivos/subir-archivos.service';
import { URL_IMGS } from 'environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { EmpresasService } from '../../../services/empresas/empresas.service';

declare var $;

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css'],
})
export class EmpresasComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  public lista: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  empresa: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _empresaService: EmpresasService,
    private _subirArchivos: SubirArchivosService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl(null, [Validators.required]),
      direccion: new FormControl(null, [Validators.required]),
      telefono: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
    });
    this.consultarDatos(true);
  }
  consultarDatos(flag = false) {
    this._empresaService.get({}).subscribe((res: any) => {
      this.lista = res.empresas;
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
      if (this.empresa._id) {
        let empresaTemp = this.form.value;
        empresaTemp.img = this.empresa.img;
        this._empresaService
          .update(this.empresa._id, empresaTemp)
          .subscribe((res: any) => {
            this._empresaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Registro actualizado correctamente'
            );

            this.limpiarCampos();
          });
      } else {
        this._empresaService.insert(this.form.value).subscribe((res: any) => {
          this._empresaService._toastService.showNotification(
            'top',
            'center',
            'success',
            'Registro guardado correctamente'
          );

          this.limpiarCampos();
          // this.consultarDatos();
        });
      }
    } else {
      this._empresaService._toastService.showNotification(
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
              this._empresaService._toastService.showNotification(
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
    this.empresa = this.lista[index];

    console.log(this.empresa);
    this.form.patchValue(this.empresa);
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
          this._empresaService.delete(id).subscribe((res: any) => {
            this._empresaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Registro eliminado correctamente'
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
    this.form.reset();

    $('#header-form').collapse('toggle');
    this.empresa = {};

    this.consultarDatos();
    this.enableCampos();
  }
}
