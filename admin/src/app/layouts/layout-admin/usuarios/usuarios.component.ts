import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import Swal from "sweetalert2";
import { UsuariosService } from "../../../services/usuarios/usuarios.service";
import { CuponesService } from "../../../services/cupones/cupones.service";
import { DataTableDirective } from "angular-datatables";
import { LanguageDataTables } from "app/config/config";
import { Subject } from "rxjs";
import { URL_IMGS } from "environments/environment";
import { CarritoSuscripcionService } from "../../../services/carrito-suscripcion/carrito-suscripcion.service";
import { DetalleSuscripcionService } from "../../../services/detalle-suscripcion/detalle-suscripcion.service";
import { ToastService } from "../../../services/toast/toast.service";
import { MailingService } from "../../../services/mailing/mailing.service";
import { VentasService } from "app/services/ventas/ventas.service";
import * as XLSX from "xlsx";

declare var $;

@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.css"],
})
export class UsuariosComponent implements OnInit {
  public lista: any[] = [];
  public suscripciones: any[] = [];
  public url = `${URL_IMGS}usuarios/`;
  Listaproductos: any[] = [];
  prodEncontrados = false;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = LanguageDataTables;
  dtTrigger: Subject<any> = new Subject();
  constructor(
    private _usuarioService: UsuariosService,
    private _carritoSuscripcionService: CarritoSuscripcionService,
    private _detalleSuscripcionService: DetalleSuscripcionService,
    private _toastService: ToastService,
    private _mailingService: MailingService,
    private _ventasService: VentasService
  ) {}

  ngOnInit(): void {
    this.consultarDatos(true);
  }
  consultarDatos(flag = false) {
    this._usuarioService.getCupones().subscribe((res: any) => {
      console.log(res);
      this.lista = res.usuarios;
      this._carritoSuscripcionService.get("").subscribe((res: any) => {
        console.log(res);
        this.suscripciones = res.carrito;
        if (!flag) {
          this.rerender();
        } else {
          this.dtTrigger.next();
        }
      });
    });
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
  verProdSus(datos: any) {
    if (datos != null) {
      this._carritoSuscripcionService
        .UsuarioSuscripcion(datos._id)
        .subscribe((res: any) => {
          this.Listaproductos = [];
          console.log(res);
          if (res.existe) {
            this._detalleSuscripcionService
              .getXIdCarSus(res.carrito._id)
              .subscribe((res2: any) => {
                if (res2.detalleSuscripcion.length > 0) {
                  this.Listaproductos = res2.detalleSuscripcion;
                  $("#mdlProductosSuscripcion").modal("show");
                  this.prodEncontrados = true;
                } else {
                  $("#mdlProductosSuscripcion").modal("show");
                  this.prodEncontrados = false;
                }
              });
          } else {
            this._toastService.showNotification(
              "top",
              "center",
              "warning",
              "El usuario seleccionado aun no ha creado su suscripción"
            );
          }
        });
    } else {
      this._toastService.showNotification(
        "top",
        "center",
        "warning",
        "Usuario no encontrado"
      );
    }
  }
  agregarSaldo(_id) {
    let user = this.lista.find((reg) => reg._id == _id);
    console.log("usuario", user);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        html: ` <div class="col col-md-12 col-sm-12 form-group">
          <div class="col"><label for="cantidad_donar" class=" form-control-label">ingresa la cantidad a donar:</label></div>
            <div class="col"> <input type="number" id="cantidad_donar" name="cantidad_donar" placeholder="Ingresa la cantidad a donar " class="form-control">
            <!--<small class="form-text text-muted">Ejemplo: Sin detalles en la unidad</small>-->
            </div>
          </div>`,
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          const text = $("#cantidad_donar").val();
          console.log("text", text);
          if (text != null && text !== "") {
            user.saldo =
              Number(`${text}`) + Number(`${!!user.saldo ? user.saldo : 0}`);
            console.log("new_user", user);
            this._usuarioService
              .modificarSaldo(user.email, { saldo: user.saldo })
              .subscribe((res: any) => {
                console.log("res", res);
                this._usuarioService._toastService.showNotification(
                  "top",
                  "center",
                  "success",
                  "Saldo agregado correctamente"
                );
                /* this.consultarDatos(); */
                this._mailingService
                  .regalarSaldoAmigo(user.email, text, user.email, "")
                  .toPromise();
              });
          } else {
            this._usuarioService._toastService.showNotification(
              "top",
              "center",
              "danger",
              "Cantidad no valida"
            );
          }
        }
      });
  }
  cambiarPassword(id: string, email: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "¿Estás seguro?",
        text: "Se cambiara la contraseña del usuario seleccionado",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "¡Si cambiarla!",
        cancelButtonText: "¡No, cancelar!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this._usuarioService
            .changePassword(id)
            .subscribe(async (res: any) => {
              const { value: formValues } = await Swal.fire({
                title: "Nueva contraseña",
                // html: `<input id="swal-input1" class="swal2-input" readonly value="${res.password}">`
                html: `
                <div class="d-flex flex-column justify-content-center align-items-center">
                  <a id="new_pass" href="mailto:${email}?subject=Cambio de contraseña&body=Tu nueva contraseña es ${res.password}">${res.password}</a>
                  <button class="btn mr-2" onclick="copyToClipBoard('new_pass')">Copiar</button>
                </div>`,

                focusConfirm: false,
                // preConfirm: () => {
                //   return [
                //     document.getElementById('swal-input1').value,
                //     document.getElementById('swal-input2').value
                //   ]
                // }
              });
            });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            "Cancelado",
            "No se cambio la contraseña :)",
            "error"
          );
        }
      });
  }

  async excelComprasSaldo(usuario) {
    console.log("usuario", usuario);
    let json = await this._ventasService
      .giftCardSaldoComprado(usuario)
      .toPromise();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json.pedidos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "resumen_compras_saldo.xlsx");
  }
  async giftCardSaldoUsado(usuario) {
    let json = await this._ventasService
      .giftCardSaldoComprado(usuario)
      .toPromise();

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json.pedidos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "resumen_uso_saldo.xlsx");
  }
}
