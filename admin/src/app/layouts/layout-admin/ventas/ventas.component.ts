import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { URL_IMGS } from '../../../../environments/environment';
import { DataTableDirective } from 'angular-datatables';
import { LanguageDataTables } from 'app/config/config';
import { Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { VentasService } from '../../../services/ventas/ventas.service';
declare var $;

import * as XLSX from 'xlsx';
@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
})
export class VentasComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public url = `${URL_IMGS}pedido/`;
  public lista: any[] = [];
  public hidden: boolean = false;
  public form: FormGroup;
  public venta: any = {};
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();

  paginas: number[] = [];
  pagina: number = 1;

  order_by: string = 'fechaCompra';
  order_direction: number = -1;

  page: number = 1;

  search: string = '';
  constructor(private _ventaService: VentasService) {}

  ngOnInit(): void {
    this.hidden = true;
    this.form = new FormGroup({
      fechaCompra: new FormControl(null, Validators.required),
      fechaRecepcion: new FormControl(null, Validators.required),
      precioTotal: new FormControl(null, Validators.required),
      cantidadTotal: new FormControl(null, [
        Validators.required,
        Validators.nullValidator,
      ]),
      metodoPago: new FormControl(null, [
        Validators.required,
        Validators.nullValidator,
      ]),
      referenciaPago: new FormControl(null, [
        Validators.required,
        Validators.nullValidator,
      ]),
      contacto: new FormControl(null, Validators.required),
      formaContacto: new FormControl(null, Validators.required),
      estatusPago: new FormControl(null, Validators.required),
      estatusEnvio: new FormControl(null, Validators.required),
      direccion: new FormControl(null, Validators.required),
      cupon: new FormControl(null, Validators.required),
      usuario: new FormControl(null, Validators.required),
      telefono: new FormControl(null, Validators.required),
      empaque: new FormControl(null, Validators.required),
      cantidadEmpaque: new FormControl(null, Validators.required),
      precioEmpaques: new FormControl(null, Validators.required),
      horarioRecepcion: new FormControl(null, Validators.required),
      comentario: new FormControl(null, Validators.required),
    });
    this.consultarDatos(true);
  }
  // rerender(): void {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     // Destroy the table first
  //     dtInstance.destroy();
  //     // Call the dtTrigger to rerender again
  //     setTimeout(() => {
  //       this.dtTrigger.next();
  //     }, 1000);
  //   });
  //  }
  consultarDatos(flag = false) {
    this._ventaService
      .get({
        pagina: this.pagina,
        order_by: this.order_by,
        order_direction: this.order_direction,
        search: this.search,
      })
      .subscribe((res: any) => {
        console.log(res);
        this.lista = res.pedidos;
        this.paginas = res.paginas;

        if (!flag) {
          // this.rerender();
        } else {
          // this.dtTrigger.next();
        }
      });
  }
  changePage(event: any) {
    console.log(event);
    this.pagina = event;
    this.consultarDatos();
  }

  changeOrder(order_by: string) {
    if (order_by == this.order_by) {
      this.order_direction = this.order_direction * -1;
    } else {
      this.order_direction = -1;
    }
    this.order_by = order_by;
    this.consultarDatos();
  }

  add() {
    if (this.form.valid) {
      if (this.venta._id) {
        console.log(this.form.value);
        this.enableCampos();
        let ventaTemp = this.venta;
        ventaTemp.fechaCompra = this.form.get('fechaCompra').value;
        ventaTemp.fechaRecepcion = this.form.get('fechaRecepcion').value;
        ventaTemp.horarioRecepcion = this.form.get('horarioRecepcion').value;
        ventaTemp.estatusPago = this.form.get('estatusPago').value;
        ventaTemp.estatusEnvio = this.form.get('estatusEnvio').value;
        console.log(ventaTemp);

        this._ventaService
          .update(this.venta._id, ventaTemp)
          .subscribe((res: any) => {
            this._ventaService._toastService.showNotification(
              'top',
              'center',
              'success',
              'Venta actualizada correctamente'
            );
            this.limpiarCampos();
          });
      }
    }
  }
  update(index, flag = false) {
    window.scroll(0, 0);
    if (flag) {
      this.enableCampos();
    }
    this.disableCamposEditar();
    this.venta = this.lista[index];
    this.form.setValue({
      fechaCompra: this.venta.fechaCompra.split('T')[0],
      fechaRecepcion: this.venta.fechaRecepcion.split('T')[0],
      precioTotal: this.venta.precioTotal,
      cantidadTotal: this.venta.cantidadTotal,
      metodoPago: this.venta.metodoPago,
      referenciaPago: this.venta.referenciaPago,
      contacto: this.venta.contacto ? 'Si' : 'No',
      formaContacto: this.venta.formaContacto,
      estatusPago: this.venta.estatusPago,
      estatusEnvio: this.venta.estatusEnvio,
      direccion: this.venta.direccion.calle,
      cupon:
        this.venta.cupon != null
          ? 'Código:' +
            this.venta.cupon.codigo +
            ' Descuento: %' +
            this.venta.cupon.valor
          : null,
      usuario: this.venta.usuario.nombre + ' - ' + this.venta.usuario.email,
      empaque: this.venta.empaque.tipoEmpaque,
      cantidadEmpaque: this.venta.cantidadEmpaque,
      precioEmpaques: this.venta.empaque.precio * this.venta.cantidadEmpaque,
      horarioRecepcion: this.venta.horarioRecepcion,
      telefono: this.venta.usuario.telefono
        ? this.venta.usuario.telefono
        : 'No introducido',
      comentario: this.venta.comentario
        ? this.venta.comentario
        : 'Sin comentarios',
    });
    $('#header-form').collapse('show');
  }
  ver(index) {
    this.disableCampos();
    this.update(index);
  }
  disableCampos() {
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
    this.form.get('horarioRecepcion').disable();
    this.form.get('comentario').disable();
  }
  disableCamposEditar() {
    this.hidden = false;
    this.form.get('fechaCompra').disable();
    this.form.get('fechaRecepcion').disable();
    this.form.get('precioTotal').disable();
    this.form.get('cantidadTotal').disable();
    this.form.get('metodoPago').disable();
    this.form.get('referenciaPago').disable();
    this.form.get('contacto').disable();
    this.form.get('formaContacto').disable();
    this.form.get('direccion').disable();
    this.form.get('cupon').disable();
    this.form.get('usuario').disable();
    this.form.get('empaque').disable();
    this.form.get('cantidadEmpaque').disable();
    this.form.get('precioEmpaques').disable();
    this.form.get('comentario').disable();
  }
  enableCampos() {
    this.hidden = false;
    this.form.get('fechaCompra').enable();
    this.form.get('fechaRecepcion').enable();
    this.form.get('precioTotal').enable();
    this.form.get('cantidadTotal').enable();
    this.form.get('metodoPago').enable();
    this.form.get('referenciaPago').enable();
    this.form.get('contacto').enable();
    this.form.get('formaContacto').enable();
    this.form.get('estatusPago').enable();
    this.form.get('estatusEnvio').enable();
    this.form.get('horarioRecepcion').enable();
    this.form.get('comentario').enable();
  }
  limpiarCampos() {
    this.form.setValue({
      fechaCompra: null,
      fechaRecepcion: null,
      precioTotal: null,
      cantidadTotal: null,
      metodoPago: null,
      referenciaPago: null,
      contacto: null,
      formaContacto: null,
      estatusPago: null,
      estatusEnvio: null,
      direccion: null,
      cupon: null,
      usuario: null,
      empaque: null,
      cantidadEmpaque: null,
      precioEmpaques: null,
      horarioRecepcion: null,
      comentario: null,
    });
    $('#header-form').collapse('toggle');
    this.enableCampos();
    this.consultarDatos();
    this.hidden = true;
    this.venta = {};
    // $header_form.collapse(
    //   'toggle'
    // )
  }

  obtenerPaginas(): any[] {
    // retorna 3 paginas antes y 3 despues de la pagina actual
    return this.paginas.filter(
      (pagina, index) => pagina - 3 <= this.pagina && pagina + 3 >= this.pagina
    );
  }
  async generateExcel() {
    let json = this.lista.map(({ _id, __v, ...venta }) => ({
      ...venta,
      contacto: venta.contacto ? 'Si' : 'No',
      usuario: `${venta.usuario.nombre} - ${venta.usuario.email} - ${
        venta.usuario.telefono ? venta.usuario.telefono : 'No introducido'
      }`,
      direccion: `${venta.direccion.nombre} - ${venta.direccion.apellidos} - ${venta.direccion.calle} - ${venta.direccion.numeroInterior} - ${venta.direccion.referencia} - ${venta.direccion.codigoPostal} ${venta.direccion.colonia}`,
      productos: venta.productos
        .map(
          (producto) =>
            `${producto.producto.nombre} - ${producto.producto.sku} - ${producto.paquete.paquete} - Cantidad: ${producto.cantidad} - $${producto.paquete.precio} - $${producto.subtotal} |`
        )
        .join('\n'),
      empaque: venta.empaque.tipoEmpaque,
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'ventas.xlsx');
  }
}
