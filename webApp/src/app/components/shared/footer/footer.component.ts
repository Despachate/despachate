import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListaComprasService } from 'src/app/services/listas-compras/lista-compras.service';
import { OfertaService } from 'src/app/services/oferta/oferta.service';
import { ToastService } from 'src/app/services/toast/toast.service';
declare var $;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  fullYear = new Date().getFullYear();

  constructor(private router: Router,) { }

  ngOnInit(): void {


  }

}
