import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { CuponesService } from '../../../services/cupones/cupones.service';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { InventarioService } from '../../../services/inventario/inventario.service';
import { ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../services/productos/productos.service';
declare var $;
@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  public form: FormGroup;
  public hidden: boolean = false;
  inventario: any = {};
  lista: any[] = [];
  idProducto:string;
  producto:string;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  constructor(private _inventarioService : InventarioService,
              private _productoService: ProductosService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      paquete: new FormControl(null, Validators.required),
      stock: new FormControl(null, Validators.required),
      precio: new FormControl(null, Validators.required),
     });
     this.idProducto = this.route.snapshot.params.idProd;
     console.log(this.idProducto);
     this._productoService.getById(this.idProducto).subscribe((res:any)=>{
      this.producto = res.producto.nombre;
     });
     this.consultarDatos(true);
  }
  consultarDatos(flag = false){
    this._inventarioService.getById(this.idProducto).subscribe((res: any)=>{
      console.log(res);
      this.lista = res.inventario;
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
      if(this.inventario._id){
        this._inventarioService.update(this.inventario._id,{...this.form.value,producto:this.idProducto}).subscribe((res:any)=>{
          this._inventarioService._toastService.showNotification('top','center','success','Inventario actualizado correctamente');
          this.limpiarCampos();
        })
      }else{
          this._inventarioService.insert({...this.form.value,producto:this.idProducto}).subscribe((res:any)=>{
            this._inventarioService._toastService.showNotification('top','center','success','Inventario guardado correctamente');
            
            this.limpiarCampos();
          })
        
      }
    }else{
      this._inventarioService._toastService.showNotification('top','center','danger','Formulario invalido, llena todos los campos');
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          const element = this.form.controls[key];
          if(!element.valid){
            console.log(element);
            if(element.errors.required){
              this._inventarioService._toastService.showNotification('top','center','danger',`El campo ${key} es requerido`);
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
    this.inventario = this.lista[index];
    console.log(this.inventario);
    this.form.setValue({
      paquete: this.inventario.paquete,
      precio: this.inventario.precio,
      stock: this.inventario.stock,
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
        this._inventarioService.delete(id).subscribe((res:any)=>{
          this._inventarioService._toastService.showNotification('top','center','success','Inventario eliminado correctamente');
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
   this.form.get('paquete').disable();
   this.form.get('stock').disable();
  }
  enableCampos(){
   this.hidden=false;
   this.form.get('precio').enable();
   this.form.get('paquete').enable();
   this.form.get('stock').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      precio: null,
      paquete:null,
      stock: null,
    });
    $('#header-form').collapse(
      'toggle'
    )
    this.inventario = {};
    this.consultarDatos();
    this.enableCampos();
  }
}
