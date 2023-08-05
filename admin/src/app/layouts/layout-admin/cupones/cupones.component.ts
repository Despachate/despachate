import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { CuponesService } from '../../../services/cupones/cupones.service';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
declare var $;
@Component({
  selector: 'app-cupones',
  templateUrl: './cupones.component.html',
  styleUrls: ['./cupones.component.css']
})
export class CuponesComponent implements OnInit {
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
  
  constructor(private _usuarioService: UsuariosService,
    private _cuponService: CuponesService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      codigo: new FormControl(null, Validators.required),
      valor: new FormControl(null, Validators.required),
      tipoCupon: new FormControl(null, Validators.required),
      idUsuario: new FormControl(null, Validators.required),
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
    this._cuponService.get().subscribe((res: any)=>{
      console.log(res);
      this.lista = res.cupones;
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
        this._cuponService.update(this.cupon._id,this.form.value).subscribe((res:any)=>{
          this._cuponService._toastService.showNotification('top','center','success','Cupón actualizado correctamente');
          this.limpiarCampos();
        })
      }else{
          this._cuponService.insert(this.form.value).subscribe((res:any)=>{
            this._cuponService._toastService.showNotification('top','center','success','Cupón guardado correctamente');
            
            this.limpiarCampos();
          })
        
      }
    }else{
      this._cuponService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if(!element.valid){
            console.log(element);
            if(element.errors.required){
              this._cuponService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
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
      codigo: this.cupon.codigo,
      valor: this.cupon.valor,
      tipoCupon: this.cupon.tipoCupon,
      idUsuario: this.cupon.idUsuario,
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
        this._cuponService.delete(id).subscribe((res:any)=>{
          this._cuponService._toastService.showNotification('top','center','success','Cupón eliminado correctamente');
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
   this.form.get('valor').disable();
   this.form.get('tipoCupon').disable();
   this.form.get('codigo').disable();
   this.form.get('idUsuario').disable();
  }
  enableCampos(){
   this.hidden=false;
   this.form.get('valor').enable();
   this.form.get('tipoCupon').enable();
   this.form.get('codigo').enable();
   this.form.get('idUsuario').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      codigo: null,
      valor:null,
      idUsuario: null,
      tipoCupon:null,
    });
    $('#header-form').collapse(
      'toggle'
    )
    this.cupon = {};
    this.consultarDatos();
    this.enableCampos();
  }

}
