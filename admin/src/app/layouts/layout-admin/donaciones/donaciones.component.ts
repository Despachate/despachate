import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { URL_IMGS } from 'environments/environment';
import { DonacionesService } from '../../../services/donaciones/donaciones.service';
import { SubirArchivosService } from '../../../services/subir-archivos/subir-archivos.service';
declare var $;
@Component({
  selector: 'app-donaciones',
  templateUrl: './donaciones.component.html',
  styleUrls: ['./donaciones.component.css']
})
export class DonacionesComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public lista: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;
  donacion: any = {};
  public imagenSubir: File;
  public imagenTemp: any = null;
  public imgEditar = '';
  public url = `${URL_IMGS}donaciones/`;
  public archivos: any[] = [];
  public archivosSubir: any[] = [];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  constructor(private _donacionService: DonacionesService,
              private _subirArchivos: SubirArchivosService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      img: new FormControl(null),
      estatus: new FormControl(null, Validators.required),
      descripcion: new FormControl(null, Validators.required),
     });
     this.consultarDatos(true);
  }
  consultarDatos(flag = false){
    this._donacionService.get().subscribe((res: any)=>{
      console.log(res);
      this.lista = res.donaciones;
      if(!flag){
        this.rerender();
      }else{
        this.dtTrigger.next();
      }
    })
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
    if(this.form.valid){
      if(this.donacion._id){
        let donacionTemp = this.form.value;
        donacionTemp.img = this.donacion.img
        this._donacionService.update(this.donacion._id,donacionTemp).subscribe((res:any)=>{
          this._donacionService._toastService.showNotification('top','center','success','Donación actualizada correctamente');
          if(this.archivosSubir.length > 0){
            this.blockUI.start();
            this._subirArchivos.subirArchivo(this.archivosSubir,'donaciones',this.donacion._id).then((res: any)=>{
              this.limpiarCampos();
            })
          }else{
            this.limpiarCampos();
          }
          
        })
      }else{
        if(this.archivosSubir.length>0){
          this._donacionService.insert(this.form.value).subscribe((res:any)=>{
            this._donacionService._toastService.showNotification('top','center','success','Donación guardada correctamente');
            this.blockUI.start();
            this._subirArchivos.subirArchivo(this.archivosSubir,'donaciones',res.donacion._id).then((res: any)=>{
              this.limpiarCampos();
            })
          })
        }else{
          this._donacionService._toastService.showNotification('top','center','danger','No se selecciono una imagen');
        }
      }
    }else{
      this._donacionService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if(!element.valid){
            console.log(element);
            if(element.errors.required){
              this._donacionService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
            }
          }
        }
      }
    }
   }
  update(index,flag=false) { window.scroll(0,0);
    if(flag){
      this.enableCampos();
    }
    this.donacion = this.lista[index];
    this.imgEditar = this.donacion.img;
    this.form.setValue({
      nombre : this.donacion.nombre,
      descripcion : this.donacion.descripcion,
      estatus : this.donacion.estatus,
      img : null,
    });
    $('#header-form').collapse('show');
  }
  delete(id) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: '¿Estas seguro?',
      text: 'Esta acción no es reversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._donacionService.delete(id).subscribe((res:any)=>{
          this._donacionService._toastService.showNotification('top','center','success','Donación eliminada correctamente');
          this.consultarDatos();
        })
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelado',
          'Tu registro se encuentra seguro :)',
          'error'
        )
      }
    });
  }
  ver(index) {
    this.disableCampos();
    this.update(index);
  }
  seleccionImage( archivo: File ) {
    this.imgEditar = '';
    const reader = new FileReader();
    const urlImagenTemp = reader.readAsDataURL( archivo );
    reader.onloadend = () => {
      this.imagenTemp = reader.result;
      this.archivos = [
        reader.result
      ];
      this.archivosSubir = [
        archivo
      ];
    };
  }
  disableCampos(){
    this.hidden = true;
    this.form.get('nombre').disable();
    this.form.get('descripcion').disable();
    this.form.get('img').disable();
    this.form.get('estatus').disable();
  }
  enableCampos(){
    this.hidden = false;
    this.form.get('nombre').enable();
    this.form.get('descripcion').enable();
    this.form.get('img').enable();
    this.form.get('estatus').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      nombre : null,
      descripcion : null,
      estatus : null,
      img : null,
    });
    this.imgEditar =  '';
    this.imagenTemp = null;
    this.archivosSubir = [];
    this.donacion = {};
    $('#header-form').collapse(
      'toggle'
    );
    this.enableCampos();
    this.consultarDatos();
  }
}
