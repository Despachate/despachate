import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { CarruselesService } from 'app/services/carruseles/carruseles.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
declare var $;
@Component({
  selector: 'app-carruseles',
  templateUrl: './carruseles.component.html',
  styleUrls: ['./carruseles.component.css']
})
export class CarruselesComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public lista: any[] = [];
  public listaUsuarios: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;
  cupon: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  
  constructor(private _carruselesService: CarruselesService, private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      titulo: new FormControl(null, Validators.required),
     });
     this.consultarDatos(true);
  }
  consultarDatos(flag = false){
    this._carruselesService.get().subscribe((res: any)=>{
      console.log(res);
      this.lista = res.carruseles;
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
      if(this.cupon._id){
        this._carruselesService.update(this.cupon._id,this.form.value).subscribe((res:any)=>{
          this._carruselesService._toastService.showNotification('top','center','success','Carrusel actualizado correctamente');
          this.limpiarCampos();
        })
      }else{
          this._carruselesService.insert(this.form.value).subscribe((res:any)=>{
            this._carruselesService._toastService.showNotification('top','center','success','Carrusel guardado correctamente');
            
            this.limpiarCampos();
          })
        
      }
    }else{
      this._carruselesService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if(!element.valid){
            console.log(element);
            if(element.errors.required){
              this._carruselesService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
            }
          }
        }
      }
    }
  }
  update(index, flag=false) { window.scroll(0,0);
    if(flag){
      this.enableCampos();
    }
    this.cupon = this.lista[index];
    console.log(this.cupon);
    this.form.setValue({
      titulo: this.cupon.titulo,
    });
    // this.disableCampos();
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
        this._carruselesService.delete(id).subscribe((res:any)=>{
          this._carruselesService._toastService.showNotification('top','center','success','Carrusel eliminado correctamente');
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
   this.form.get('titulo').disable();
  }
  enableCampos(){
   this.hidden=false;
   this.form.get('titulo').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      titulo: null,
    });
    $('#header-form').collapse(
      'toggle'
    )
    this.cupon = {};
    this.consultarDatos();
    this.enableCampos();
  }
  carruselproductos(_id) {
    this.router.navigate([`/admin/carruselproductos/${_id}`]);
  }

}
