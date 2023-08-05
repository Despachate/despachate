import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { URL_IMGS } from '../../../../environments/environment';
import { DepartamentosService } from '../../../services/departamentos/departamentos.service';
import { SubirArchivosService } from '../../../services/subir-archivos/subir-archivos.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { LanguageDataTables } from '../../../config/config';
import Swal from 'sweetalert2';
declare var $;

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css'],
})
export class DepartamentosComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  // imagenes
  public imagenSubir: File;
  public imagenTemp: any = null;
  public archivos: any[] = [];
  public archivosSubir: any[] = [];
  public imgEditar = '';
  public url = `${URL_IMGS}departamentos/`;

  public lista: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  departamento: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _departamentoService: DepartamentosService,
    private _subirArchivos: SubirArchivosService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      img: new FormControl(null),
      nombre: new FormControl(null, Validators.required),
      order: new FormControl(null, Validators.required),
    });
    this.consultarDatos(true);
  }
  consultarDatos(flag = false) {
    this._departamentoService.get().subscribe((res: any) => {
      this.lista = res.departamentos;
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
      if (this.departamento._id) {
        let departamentoTemp = this.form.value;
        departamentoTemp.img = this.departamento.img;
        this._departamentoService
          .update(this.departamento._id, departamentoTemp)
          .subscribe((res: any) => {
            this._departamentoService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Departamento actualizado correctamente'
            );
            if (this.archivosSubir.length > 0) {
              this.blockUI.start();
              this._subirArchivos
                .subirArchivo(
                  this.archivosSubir,
                  'departamentos',
                  this.departamento._id
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
          this._departamentoService
            .insert(this.form.value)
            .subscribe((res: any) => {
              this._departamentoService._toastService.showNotification(
                'top',
                'center',
                'success',
                'Departamento guardado correctamente'
              );
              this.blockUI.start();
              this._subirArchivos
                .subirArchivo(
                  this.archivosSubir,
                  'departamentos',
                  res.departamento._id
                )
                .then((res: any) => {
                  this.limpiarCampos();
                  // this.consultarDatos();
                });
            });
        } else {
          this._departamentoService._toastService.showNotification(
            'top',
            'center',
            'danger',
            'No se selecciono una imagen'
          );
        }
      }
    } else {
      this._departamentoService._toastService.showNotification(
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
              this._departamentoService._toastService.showNotification(
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
    this.departamento = this.lista[index];
    this.imgEditar = this.departamento.img;
    console.log(this.departamento);
    this.form.setValue({
      img: null,
      nombre: this.departamento.nombre,
      order: !!this.departamento.order ? this.departamento.order : null,
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
          this._departamentoService.delete(id).subscribe((res: any) => {
            this._departamentoService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Departamento eliminado correctamente'
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
    this.form.get('img').disable();
  }
  enableCampos() {
    this.hidden = false;
    this.form.get('nombre').enable();
    this.form.get('img').enable();
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
  limpiarCampos() {
    this.form.setValue({
      img: null,
      nombre: null,
      order: null,
    });
    this.imgEditar = '';
    this.imagenTemp = null;
    $('#header-form').collapse('toggle');
    this.departamento = {};
    this.archivosSubir = [];
    this.consultarDatos();
    this.enableCampos();
  }
}
