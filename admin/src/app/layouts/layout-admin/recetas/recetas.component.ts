import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { RecetasCategoriasService } from 'app/services/recetas categorias/recetas-categorias.service';
import { SubirArchivosService } from 'app/services/subir-archivos/subir-archivos.service';
import { URL_IMGS } from 'environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RecetasService } from '../../../services/recetas/recetas.service';
declare var $;
@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.css'],
})
export class RecetasComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  // imagenes
  public imagenSubir: File;
  public imagenTemp: any = null;
  public archivos: any[] = [];
  public archivosSubir: any[] = [];
  public imgEditar = '';
  public url = `${URL_IMGS}recetas/`;

  public lista: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  receta: any = {};
  categorias: any[] = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _recetasService: RecetasService,
    private _recetasCategoriasService: RecetasCategoriasService,
    private _subirArchivos: SubirArchivosService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl(null, [Validators.required]),
      duracion: new FormControl(null, [Validators.required]),
      code: new FormControl(null, [Validators.required]),
      etiquetas: new FormControl(null, [Validators.required]),
      descripcion: new FormControl(null, [Validators.required]),
      listo_en: new FormControl(null, [Validators.required]),
      preparacion: new FormControl(null, [Validators.required]),
      cocinar: new FormControl(null, [Validators.required]),
      porciones: new FormControl(null, [Validators.required]),
      categoria: new FormControl(null, [Validators.required]),
      img: new FormControl(null),
    });
    this.consultarDatos(true);
    this.getCategoriasReceta();
  }
  consultarDatos(flag = false) {
    this._recetasService.get().subscribe((res: any) => {
      this.lista = res.recetas;
      if (!flag) {
        this.rerender();
      } else {
        this.dtTrigger.next();
      }
    });
  }

  getCategoriasReceta() {
    this._recetasCategoriasService.get().subscribe((res: any) => {
      this.categorias = res.recetas_categoria;
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
      if (this.receta._id) {
        let departamentoTemp = this.form.value;
        departamentoTemp.img = this.receta.img;
        this._recetasService
          .update(this.receta._id, departamentoTemp)
          .subscribe((res: any) => {
            this._recetasService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Receta actualizado correctamente'
            );
            if (this.archivosSubir.length > 0) {
              this.blockUI.start();
              this._subirArchivos
                .subirArchivo(this.archivosSubir, 'recetas', this.receta._id)
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
          this._recetasService.insert(this.form.value).subscribe((res: any) => {
            this._recetasService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Receta guardado correctamente'
            );
            this.blockUI.start();
            this._subirArchivos
              .subirArchivo(this.archivosSubir, 'recetas', res.receta._id)
              .then((res: any) => {
                this.limpiarCampos();
                // this.consultarDatos();
              });
          });
        } else {
          this._recetasService._toastService.showNotification(
            'top',
            'center',
            'danger',
            'No se selecciono una imagen'
          );
        }
      }
    } else {
      this._recetasService._toastService.showNotification(
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
              this._recetasService._toastService.showNotification(
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
    this.receta = { ...this.lista[index] };
    this.imgEditar = this.receta.img;
    this.form.setValue({
      nombre: this.receta.nombre,
      duracion: this.receta.duracion,
      code: this.receta.code,
      etiquetas: this.receta.etiquetas,
      descripcion: this.receta.descripcion,
      listo_en: this.receta.listo_en,
      preparacion: this.receta.preparacion,
      cocinar: this.receta.cocinar,
      porciones: this.receta.porciones,
      categoria: this.receta.categoria._id,
      img: '',
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
          this._recetasService.delete(id).subscribe((res: any) => {
            this._recetasService._toastService.showNotification(
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
      nombre: null,
      duracion: null,
      code: null,
      etiquetas: null,
      descripcion: null,
      listo_en: null,
      preparacion: null,
      cocinar: null,
      porciones: null,
      categoria: null,
      img: null,
    });
    this.imgEditar = '';
    this.imagenTemp = null;
    $('#header-form').collapse('toggle');
    this.receta = {};
    this.archivosSubir = [];
    this.consultarDatos();
    this.enableCampos();
  }
}
