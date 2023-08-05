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
import { CarritoSuscripcionService } from '../../../services/carrito-suscripcion/carrito-suscripcion.service';
declare var $;
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
  public hiddenSuscripcion: boolean = true;
  public form: FormGroup;
  public form2: FormGroup;
  public form3: FormGroup;
  public detallePedido: any = {};
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  constructor(private _route:ActivatedRoute, private _detalleVentasService: DetalleVentasService,
              private _ventaService: VentasService, private _suscripcionService: CarritoSuscripcionService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      fechaCompra: new FormControl(null, Validators.required),
      fechaRecepcion: new FormControl(null, Validators.required),
      horarioRecepcion: new FormControl(null, Validators.required),
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
      cantidadEmpaque: new FormControl(null, Validators.required),
      precioEmpaques: new FormControl(null, Validators.required),
     });
     this.form2 = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      telefono: new FormControl(null, Validators.required),
      calle: new FormControl(null, Validators.required),
      colonia: new FormControl(null, Validators.required),
      numeroInterior: new FormControl(null, Validators.required),
      referencia: new FormControl(null, [Validators.required, Validators.nullValidator]),
      codigoPostal: new FormControl(null, [Validators.required, Validators.nullValidator]),
      usuario: new FormControl(null, [Validators.required, Validators.nullValidator]),
     });
     this.form3 = new FormGroup({
      frecuenciaEntrega: new FormControl(null, [Validators.required]),
      horarioEntrega: new FormControl(null, [Validators.required]),
      diaRecepcion: new FormControl(null, [Validators.required]),
      contacto: new FormControl(null, [Validators.required]),
      formaContacto: new FormControl(null, [Validators.required]),
      metodoPago: new FormControl(null, [Validators.required]),
      referenciaPago: new FormControl(null, [Validators.required]),
      precioTotal: new FormControl(null, [Validators.required]),
      cantidadTotal: new FormControl(null, [Validators.required]),
      direccion: new FormControl(null, [Validators.required]),
      empaque: new FormControl(null, [Validators.required]),
      cantidadEmpaques: new FormControl(null, [Validators.required]),
      fecha: new FormControl(null, [Validators.required]),
      usuario: new FormControl(null, [Validators.required]),
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
        horarioRecepcion: this.detallePedido.horarioRecepcion,
        precioTotal : this.detallePedido.precioTotal,
        cantidadTotal : this.detallePedido.cantidadTotal,
        metodoPago : this.detallePedido.metodoPago,
        referenciaPago : this.detallePedido.referenciaPago,
        contacto : this.detallePedido.contacto? 'Si':'No',
        formaContacto : this.detallePedido.formaContacto,
        estatusPago : this.detallePedido.estatusPago,
        estatusEnvio : this.detallePedido.estatusEnvio,
        direccion : this.detallePedido.direccion.calle,
        cupon : this.detallePedido.cupon != null ? "Código:"+this.detallePedido.cupon.codigo + " Descuento: %"+this.detallePedido.cupon.valor+" pesos": null,
        usuario : this.detallePedido.usuario != null ? this.detallePedido.usuario.nombre + " - "+this.detallePedido.usuario.email:'Usuario no encontrado',
        empaque : this.detallePedido.empaque != null ? this.detallePedido.empaque.tipoEmpaque: 'Empaque no encontrado',
        cantidadEmpaque : this.detallePedido.cantidadEmpaque,
        precioEmpaques : this.detallePedido.empaque != null ? this.detallePedido.cantidadEmpaque*this.detallePedido.empaque.precio:0,

      });
      this.form2.setValue({
        nombre : this.detallePedido.direccion != null ? this.detallePedido.direccion.apellidos:'Dato no encontrado',
        telefono: this.detallePedido.usuario != null && this.detallePedido.usuario.telefono? this.detallePedido.usuario.telefono:'No introducido',
        calle : this.detallePedido.direccion != null ? this.detallePedido.direccion.calle:'Dato no encontrado',
        colonia: this.detallePedido.direccion != null && this.detallePedido.direccion.colonia? this.detallePedido.direccion.colonia:'Dato no encontrado',
        numeroInterior : this.detallePedido.direccion != null ? this.detallePedido.direccion.numeroInterior:'Dato no encontrado',
        referencia : this.detallePedido.direccion != null ? this.detallePedido.direccion.referencia: 'Dato no encontrado',
        codigoPostal : this.detallePedido.direccion != null ? this.detallePedido.direccion.codigoPostal: 'Dato no encontrado',
        usuario : this.detallePedido.usuario != null ? this.detallePedido.usuario.nombre: 'Dato no encontrado',
    });
    if(this.form.get('referenciaPago').value === 'Suscripción'){
      this.hiddenSuscripcion = false;
      this._suscripcionService.UsuarioSuscripcion(this.detallePedido.usuario._id).subscribe((res: any)=>{
        console.log(res);
        this.form3.setValue({
          frecuenciaEntrega: res.carrito.frecuenciaEntrega,
          horarioEntrega: res.carrito.horarioEntrega,
          diaRecepcion: res.carrito.diaRecepcion,
          contacto: res.carrito.contacto? 'Si':'No',
          formaContacto: res.carrito.formaContacto,
          metodoPago: res.carrito.metodoPago,
          referenciaPago: this.detallePedido.referenciaPago,
          precioTotal:  this.detallePedido.precioTotal,
          cantidadTotal : this.detallePedido.cantidadTotal,
          direccion: `${res.carrito.direccion.calle} ${res.carrito.direccion.numeroInterior} ${res.carrito.direccion.codigoPostal}`,
          empaque: `${res.carrito.empaque.tipoEmpaque}`,
          cantidadEmpaques: res.carrito.cantidadEmpaques,
          fecha: res.carrito.fecha,
          usuario: res.carrito.usuario
        });
    
      });
    }
    
    
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
      console.log("lista",this.lista);
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
    this.form.get('cantidadEmpaque').disable();
    this.form.get('precioEmpaques').disable();

    this.form2.get('nombre').disable();
    this.form2.get('calle').disable();
    this.form2.get('numeroInterior').disable();
    this.form2.get('referencia').disable();
    this.form2.get('codigoPostal').disable();
    this.form2.get('usuario').disable();

    this.form3.get('frecuenciaEntrega').disable();
    this.form3.get('horarioEntrega').disable();
    this.form3.get('diaRecepcion').disable();
    this.form3.get('contacto').disable();
    this.form3.get('formaContacto').disable();
    this.form3.get('metodoPago').disable();
    this.form3.get('referenciaPago').disable();
    this.form3.get('precioTotal').disable();
    this.form3.get('cantidadTotal').disable();
    this.form3.get('direccion').disable();
    this.form3.get('empaque').disable();
    this.form3.get('cantidadEmpaques').disable();
    this.form3.get('fecha').disable();
    this.form3.get('usuario').disable();
  }
}
