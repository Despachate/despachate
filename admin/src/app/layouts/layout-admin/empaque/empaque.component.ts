import { Component, OnInit, ViewChild } from '@angular/core';
import { EmpaquesService } from '../../../services/empaques/empaques.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { UsuariosService } from 'app/services/usuarios/usuarios.service';
import Swal from 'sweetalert2';

declare var $;

@Component({
  selector: 'app-empaque',
  templateUrl: './empaque.component.html',
  styleUrls: ['./empaque.component.css']
})
export class EmpaqueComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public lista: any[] = [];
  public listaUsuarios: any[] = [];
  public form: FormGroup;
  public hidden: boolean = false;
  empaque: any = {};

  tiposEmpaque = ['Papel', 'Tela'];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  
  constructor(private _usuarioService: UsuariosService,
    private _empaqueService: EmpaquesService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      precio: new FormControl(null, Validators.required),
      tipoEmpaque: new FormControl(null, [Validators.required, Validators.nullValidator]),
    });
     this.consultarDatos(true);
     this.consultarUsuarios();
  }
  consultarUsuarios(){
    this._usuarioService.get().subscribe((res: any)=>{
      console.log(res);
      this.listaUsuarios = res.usuarios;
    })
  }
  consultarDatos(flag = false){
    this._empaqueService.get().subscribe((res: any)=>{
      console.log(res);
      this.lista = res.empaques;
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
      if(this.empaque._id){
        this._empaqueService.update(this.empaque._id,this.form.value).subscribe((res:any)=>{
          this._empaqueService._toastService.showNotification('top','center','success','Empaque actualizado correctamente');
          this.limpiarCampos();
        })
      }else{
          this._empaqueService.insert(this.form.value).subscribe((res:any)=>{
            this._empaqueService._toastService.showNotification('top','center','success','Empaque guardado correctamente');
            this.blockUI.start();
            this.blockUI.stop();
            this.limpiarCampos();
          })
        
      }
    }else{
      this._empaqueService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if(!element.valid){
            console.log(element);
            if(element.errors.required){
              this._empaqueService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
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
    this.empaque = this.lista[index];
    console.log(this.empaque);
    this.form.setValue({
      precio: this.empaque.precio,
      tipoEmpaque: this.empaque.tipoEmpaque
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
        this._empaqueService.delete(id).subscribe((res:any)=>{
          this._empaqueService._toastService.showNotification('top','center','success','Empaque eliminado correctamente');
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
   this.form.get('precio').disable();
   this.form.get('tipoEmpaque').disable();
  }
  enableCampos(){
   this.hidden=false;
   this.form.get('precio').enable();
   this.form.get('tipoEmpaque').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      precio: null,
      tipoEmpaque:null
      
    });
    $('#header-form').collapse(
      'toggle'
    )
    this.empaque = {};
    this.consultarDatos();
    this.enableCampos();
  }

}
