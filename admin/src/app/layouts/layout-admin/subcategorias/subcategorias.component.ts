import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { SubcategoriasService } from '../../../services/subcategorias/subcategorias.service';
import { CategoriasService } from '../../../services/categorias/categorias.service';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
declare var $;
@Component({
  selector: 'app-subcategorias',
  templateUrl: './subcategorias.component.html',
  styleUrls: ['./subcategorias.component.css']
})
export class SubcategoriasComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  
  public lista: any[] = [];
  public listaCategorias: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;

  subcategoria: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private _subcategoriaService: SubcategoriasService,
    private _categoriaService:CategoriasService
    ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      categoria: new FormControl(null, Validators.required),
     });
     this.consultarDatos(true);
     this.consultarCategorias();
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
   this._subcategoriaService.get().subscribe((res: any)=>{
     console.log(res);
     this.lista = res.subcategorias;
     if(!flag){
      this.rerender();
    }else{
      this.dtTrigger.next();
    }
   })
 }
 consultarCategorias(){
  this._categoriaService.get().subscribe((res: any)=>{
    this.listaCategorias = res.categorias;
  })
}
add() {
  if(this.form.valid){
    if(this.subcategoria._id){
      this._subcategoriaService.update(this.subcategoria._id,this.form.value).subscribe((res:any)=>{
        this._subcategoriaService._toastService.showNotification('top','center','success','Subcategoria actualizada correctamente');
        this.limpiarCampos();
      })
    }else{
        this._subcategoriaService.insert(this.form.value).subscribe((res:any)=>{
          this._subcategoriaService._toastService.showNotification('top','center','success','Subcategoria guardada correctamente');
          this.blockUI.start();
          this.blockUI.stop();
          this.limpiarCampos();
        })
      
    }
  }else{
    this._subcategoriaService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
    for (const key in this.form.controls) {
      if (this.form.controls.hasOwnProperty(key)) {
        const element = this.form.controls[key];
        if(!element.valid){
          console.log(element);
          if(element.errors.required){
            this._subcategoriaService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
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
   this.subcategoria = this.lista[index];
   this.form.setValue({
     categoria: this.subcategoria.categoria._id,
     nombre: this.subcategoria.nombre,
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
       this._subcategoriaService.delete(id).subscribe((res:any)=>{
         this._subcategoriaService._toastService.showNotification('top','center','success','Subcategoria eliminada correctamente');
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
  disableCampos(){
   this.hidden=true;
   this.form.get('nombre').disable();
   this.form.get('categoria').disable();
  }
  enableCampos(){
   this.hidden=false;
   this.form.get('nombre').enable();
   this.form.get('categoria').enable();
  }
  limpiarCampos() {
   this.form.setValue({
     nombre: null,
     categoria:null,
   });
   $('#header-form').collapse(
     'toggle'
   )
   this.subcategoria = {};
   this.consultarDatos();
   this.enableCampos();
  }

}

