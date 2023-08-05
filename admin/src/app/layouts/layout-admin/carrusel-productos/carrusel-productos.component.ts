import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { CarruselProductoService } from 'app/services/carrusel-producto/carrusel-producto.service';
import { CarruselesService } from 'app/services/carruseles/carruseles.service';
import { ProductosService } from 'app/services/productos/productos.service';
import { URL_IMGS } from 'environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
declare var $;
@Component({
  selector: 'app-carrusel-productos',
  templateUrl: './carrusel-productos.component.html',
  styleUrls: ['./carrusel-productos.component.css']
})
export class CarruselProductosComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public url = `${URL_IMGS}productos/`;
  public lista: any[] = [];
  public listaSeleccionados: any[] = [];
  public hints: any[] = [];
  public hidden: boolean = false;
  public terminoBusqueda;
  private id_carrucel;
  cupon: any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  
  constructor(
    private _carruselProductosService: CarruselProductoService,
    private router: Router,
    private route: ActivatedRoute,
    private _productoService: ProductosService) { }

  ngOnInit(): void {
    this.id_carrucel = this.route.snapshot.paramMap.get('id');
    this.consultarDatos(true);
  }
  consultarDatos(flag = false){
    this._carruselProductosService.byCarrusel(this.id_carrucel).subscribe((res: any)=>{
      console.log(res);
      this.lista = res.carruselproductos;
      console.log('lista', res);
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
    if (this.listaSeleccionados.length > 0) {
      for (let i = 0 ; i < this.listaSeleccionados.length; i++) {
        this._carruselProductosService.insert({carrusel: this.id_carrucel, producto: this.listaSeleccionados[i]._id}).subscribe((res:any)=>{
          if (i == this.listaSeleccionados.length -1) {
            this.listaSeleccionados = [];
            this._carruselProductosService._toastService.showNotification('top','center','success','Productos guardados correctamente');
            
              $(`#exampleModal`).modal('toggle');
              $('.modal-backdrop').remove();
              $('body').removeClass('modal-open');
            
            this.consultarDatos();
          }
        });
      }
    } else {
      this._carruselProductosService._toastService.showNotification('top','center','danger','No se han seleccionado productos');
    }
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
        this._carruselProductosService.delete(id).subscribe((res:any)=>{
          this._carruselProductosService._toastService.showNotification('top','center','success','Carrusel eliminado correctamente');
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


  getHint(){
    this._productoService.getHintsByTermino(this.terminoBusqueda).subscribe((res:any)=>{
      this.hints = res.productos;
      console.log('productos de busqueda', this.hints);
    });
  }
  seleccionar(item) {
    this.listaSeleccionados.push(item);
  }
  quitar(id) {
    const listaTemp = [];
    for(const obj of this.listaSeleccionados) {
      if (obj._id !== id){
        listaTemp.push(obj);
      }
    }
    this.listaSeleccionados = listaTemp;
  }
}
