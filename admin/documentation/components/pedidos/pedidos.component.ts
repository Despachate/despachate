import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { URL_IMGS } from '../../../../environments/environment';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { VentasService } from '../../../services/ventas/ventas.service';
import { DetalleVentasService } from '../../../services/detalleVentas/detalle-ventas.service';
@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public url = `${URL_IMGS}pedido/`;
  public lista: any[] = [];
  public listaDatosPedido: any[] = [];
  public hidden: boolean = false;
  public form: FormGroup;
  public detallePedido: any = {};
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  constructor(private _route:ActivatedRoute, private _detalleVentasService: DetalleVentasService,
              private _ventaService: VentasService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      fechaCompra: new FormControl(null, Validators.required),
      fechaRecepcion: new FormControl(null, Validators.required),
      precioTotal: new FormControl(null, Validators.required),
      cantidadTotal: new FormControl(null, [Validators.required, Validators.nullValidator]),
      metodoPago: new FormControl(null, [Validators.required, Validators.nullValidator]),
      referenciaPago: new FormControl(null, [Validators.required, Validators.nullValidator]),
      contacto: new FormControl(null, Validators.required),
      formaContacto: new FormControl(null, Validators.required),
      estatusPago: new FormControl(null, Validators.required),
      estatusEnvio: new FormControl(null, Validators.required),
      direccion: new FormControl(null, Validators.required),
      cupon: new FormControl(null, Validators.required),
      usuario: new FormControl(null, Validators.required),
      empaque: new FormControl(null, Validators.required),
     });
     this.disableCampos();
     let id = this._route.snapshot.paramMap.get('id');
     this.consultarDatos(true,id);
     this.datosPedido(id);
  }
  datosPedido(index){
    this._ventaService.getpedidoXId(index).subscribe((res: any)=>{
      console.log(res);
      this.detallePedido = res.pedido;
      console.log(this.detallePedido);
      this.form.setValue({
        fechaCompra : this.detallePedido.fechaCompra.split('T')[0],
        fechaRecepcion : this.detallePedido.fechaRecepcion.split('T')[0],
        precioTotal : this.detallePedido.precioTotal,
        cantidadTotal : this.detallePedido.cantidadTotal,
        metodoPago : this.detallePedido.metodoPago,
        referenciaPago : this.detallePedido.referenciaPago,
        contacto : this.detallePedido.contacto,
        formaContacto : this.detallePedido.formaContacto,
        estatusPago : this.detallePedido.estatusPago,
        estatusEnvio : this.detallePedido.estatusEnvio,
        direccion : this.detallePedido.direccion.calle,
        cupon : "Código:"+this.detallePedido.cupon.codigo + " Descuento: $"+this.detallePedido.cupon.valor+" pesos",
        usuario : this.detallePedido.usuario.nombre + " - "+this.detallePedido.usuario.email,
        empaque : this.detallePedido.empaque.tipoEmpaque,
      });
  })
}
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      setTimeout(() => {
        this.dtTrigger.next();
      }, 1000);
    });
   }
  consultarDatos(flag = false,idVenta){
    this._detalleVentasService.getXIdVenta(idVenta).subscribe((res: any)=>{
      console.log(res);
      this.lista = res.detalleCarrito;
      if(!flag){
        this.rerender();
      }else{
        this.dtTrigger.next();
      }
    })
  }
  disableCampos(){
    this.hidden = true;
    this.form.get('fechaCompra').disable();
    this.form.get('fechaRecepcion').disable();
    this.form.get('precioTotal').disable();
    this.form.get('cantidadTotal').disable();
    this.form.get('metodoPago').disable();
    this.form.get('referenciaPago').disable();
    this.form.get('contacto').disable();
    this.form.get('formaContacto').disable();
    this.form.get('estatusPago').disable();
    this.form.get('estatusEnvio').disable();
    this.form.get('direccion').disable();
    this.form.get('cupon').disable();
    this.form.get('usuario').disable();
    this.form.get('empaque').disable();
  }
}
