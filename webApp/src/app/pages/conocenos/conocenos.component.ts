import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../../services/ventas/ventas.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
@Component({
  selector: 'app-conocenos',
  templateUrl: './conocenos.component.html',
  styleUrls: ['./conocenos.component.css']
})
export class ConocenosComponent implements OnInit {
  totalDonado: Number = 0;
  constructor(private router:Router, private _ventaService:VentasService, private _usuarioService:UsuariosService) { }

  ngOnInit(): void {
  }
  
  obtenerVentas(){
    console.log('entro');
    if(this._usuarioService.usuario != null){
      this._ventaService.getpedidoXusr(this._usuarioService.usuario._id).subscribe((res:any)=>{
        this.totalDonado = 0;
        for (const pedido of res.pedidos) {
          this.totalDonado += pedido.donacion;
        }
      });
    }
  }

}
