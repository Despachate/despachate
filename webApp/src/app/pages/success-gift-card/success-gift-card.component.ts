import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DetalleVentasService } from 'src/app/services/detalleVentas/detalle-ventas.service';
import { MailingService } from 'src/app/services/mailing/mailing.service';
import { StripeService } from 'src/app/services/stripe/stripe.service';
import { VentasService } from 'src/app/services/ventas/ventas.service';

@Component({
  selector: 'app-success-gift-card',
  templateUrl: './success-gift-card.component.html',
  styleUrls: ['./success-gift-card.component.css'],
})
export class SuccessGiftCardComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  terminado: boolean = false;
  constructor(
    private _stripeService: StripeService,
    private _ventasService: VentasService,
    private _detallesServcie: DetalleVentasService,
    private _mailingService: MailingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log(params);
      if (!!params.id) {
        this.retriveStripeSession(params.id);
      }
    });
  }

  retriveStripeSession(id: string) {
    this.blockUI.start('Verificando...');
    this.terminado = false;
    this._stripeService.retriveSession(id).subscribe(
      async (resp: any) => {
        console.log(resp);
        const { session } = resp;
        if (session.status === 'succeeded') {
          console.log('Pago exitoso');
        }

        if (session.status === 'failed') {
          console.log('Pago fallido');
        }

        if (session.payment_status === 'paid') {
          console.log('Pago exitoso');

          try {
            await this._ventasService
              .updateEstatusPago(id, { estatusPago: 'Pagado' })
              .toPromise();
            let { pedido } = await this._ventasService
              .getpedidoXId(id)
              .toPromise();
            let { detalleCarrito } = await this._detallesServcie
              .getXIdVenta(id)
              .toPromise();
            let { pedidos } = await this._ventasService
              .getpedidoXusr(pedido.usuario._id)
              .toPromise();

            let totalDonacion = 0;
            pedidos.forEach((pedido) => {
              totalDonacion += pedido.donacion;
            });

            console.log(pedido, detalleCarrito);
            let { direccion, empaque, usuario } = pedido;

            this._mailingService
              .correoCompraUsuario(
                usuario.email,
                pedido,
                detalleCarrito,
                direccion,
                totalDonacion
              )
              .subscribe((res: any) => {});
            this._mailingService
              .correoVentaAdmin(
                usuario.email,
                pedido,
                detalleCarrito,
                direccion,
                totalDonacion,
                usuario,
                empaque
              )
              .subscribe((res: any) => {});
            /* CORREOS DE COMPRA SALDO */
            if (!!pedido.saldo_comprado) {
              await this._mailingService
                .regalarSaldoAmigo(
                  !!pedido.correo_saldo ? pedido.correo_saldo : usuario.email,
                  pedido.saldo_comprado,
                  !!pedido.correo_saldo ? pedido.correo_saldo : usuario.email,
                  !!pedido.comentario ? pedido.comentario : ''
                )
                .toPromise();
              await this._mailingService
                .regalarSaldoAmigoAdmin(
                  usuario.email,
                  pedido.saldo_comprado,
                  !!pedido.correo_saldo ? pedido.correo_saldo : usuario.email
                )
                .toPromise();
            }
            /* if(!!pedido.saldo_usado && `${pedido.saldo_usado}` != '0') {
                await this._mailingService
                  .usoSaldoAmigoAdmin(
                    usuario.email,
                    pedido.saldo_usado
                  )
                  .toPromise();
              } */
            /* CORREOS DE COMPRA SALDO */
            this.blockUI.stop();
            this.terminado = true;
          } catch (error) {
            console.log(error);
            this.blockUI.stop();
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
