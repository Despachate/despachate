import { Component, OnInit, ViewChild } from '@angular/core';
import { CarrouselService } from 'app/services/carrousel/carrousel.service';
import { SubirArchivosService } from '../../../services/subir-archivos/subir-archivos.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { URL_IMGS } from 'environments/environment';
import { FormGroup, FormControl } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

declare var $;

@Component({
  selector: 'app-carrousel-principal',
  templateUrl: './carrousel-principal.component.html',
  styleUrls: ['./carrousel-principal.component.css']
})
export class CarrouselPrincipalComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  // imagenes
  public imagenSubir: File;
  public imagenTemp: any = null;
  public archivos: any[] = [];
  public archivosSubir: any[] = [];
  public imgEditar = '';
  public url = `${URL_IMGS}carrouseles/`;

  public lista: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  public carrousel: any = {};
  
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  
  constructor(
    private _carrouselService: CarrouselService,
    private _subirArchivos: SubirArchivosService 
    ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      img:new FormControl(null)
     });
     this.consultarDatos(true);
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

  consultarDatos(flag = false){
    this._carrouselService.get().subscribe((res: any)=>{
      console.log(res);
      this.lista = res.carrouseles;
      if(!flag){
        this.rerender();
      }else{
        this.dtTrigger.next();
      }
    })
  }
  add() {
    if(this.form.valid){
      if(this.carrousel._id){
        let carrouselTemp = this.form.value;
        carrouselTemp.img = this.carrousel.img;
        this._carrouselService.update(this.carrousel._id,carrouselTemp).subscribe((res:any)=>{
          this._carrouselService._toastService.showNotification('top','center','success','Carrusel actualizado correctamente');
          if(this.archivosSubir.length > 0){
            this.blockUI.start();
            this._subirArchivos.subirArchivo(this.archivosSubir,'carrouseles',this.carrousel._id).then((res: any)=>{
              this.limpiarCampos();
              // this.consultarDatos();
            })
          }else{
            this.limpiarCampos();
          }
        })
      }else{
        if(this.archivosSubir.length>0){
          this._carrouselService.insert(this.form.value).subscribe((res:any)=>{
            this._carrouselService._toastService.showNotification('top','center','success','Carrusel guardado correctamente');
            this._subirArchivos.subirArchivo(this.archivosSubir,'carrouseles',res.carrousel._id).then((res: any)=>{
              this.limpiarCampos();
              // this.consultarDatos();
            })
          })
        }else{
          this._carrouselService._toastService.showNotification('top','center','danger','No se selecciono una imagen');
        }
      }
    }else{
      this._carrouselService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if(!element.valid){
            console.log(element);
            if(element.errors.required){
              this._carrouselService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
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
    this.carrousel = this.lista[index];
    this.imgEditar = this.carrousel.img;
    this.form.setValue({
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
        this._carrouselService.delete(id).subscribe((res:any)=>{
          this._carrouselService._toastService.showNotification('top','center','success','Carrusel eliminado correctamente');
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
    this.form.get('img').disable();
  }
  enableCampos(){
    this.hidden = false;
    this.form.get('img').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      img : null,
    });
    this.imgEditar =  '';
    this.imagenTemp = null;
    this.carrousel = {};
    $('#header-form').collapse(
      'toggle'
    );
    this.enableCampos();
    this.consultarDatos();
    // $header_form.collapse(
    //   'toggle'
    // )
  }
}

