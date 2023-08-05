import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos/productos.service';
import { delay } from 'rxjs/operators';
import { OfertaService } from '../../services/oferta/oferta.service';
import { Router } from '@angular/router';
import { CarrouselService } from '../../services/carrousel/carrousel.service';
import { CarruselesadministrablesService } from '../../services/casuselesadministrables/carruselesadministrables.service';
import { URL_IMGS } from 'src/environments/environment';
import { DepartamentosService } from 'src/app/services/departamentos/departamentos.service';
import { ListaComprasService } from '../../services/listas-compras/lista-compras.service';
declare var $;
declare function initCarousel();
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  departamentosURLS: any = {};
  productos: any[] = [];
  prodOferta: any[] = [];
  prodVentas: any[] = [];
  prodNuevoBolsa: any[] = [];
  ProductosMasLocal: any[] = [];
  prodRecomendadoParaTi: any[] = [];
  listaCarrouseles: any[] = [];
  listaCarruselesAdministrables: any[] = [];
  modal = true;
  url: string = `${URL_IMGS}carrouseles/`;
  constructor(
    private _productoService: ProductosService,
    private _ofertaService: OfertaService,
    private _carrouselService: CarrouselService,
    private _carruselesAdministables: CarruselesadministrablesService,
    private _departamentosService: DepartamentosService,
    public _listaCompraservie: ListaComprasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._getDepartamentos();
    this._productoService.get().subscribe((res: any) => {
      //   this.productos = res.productos;
      for (let index = 0; index < 7; index++) {
        if (index < res.productos.length) {
          this.productos.push(res.productos[index]);
        }
      }
      setTimeout(() => {
        this.init();
      }, 1000);
    });
    this._productoService.getNuevoBolsa().subscribe((res: any) => {
      for (let index = 0; index < 7; index++) {
        if (index < res.productos.length) {
          this.prodNuevoBolsa.push(res.productos[index]);
        }
      }
    });
    this._productoService.getRecomendadoFavoritos().subscribe((res: any) => {
      this.prodRecomendadoParaTi = res.productos;
    });
    this._productoService.getVentas().subscribe((res: any) => {
      this.prodVentas = res.productos;
    });
    this._ofertaService.get().subscribe((res: any) => {
      this.prodOferta = res.ofertas;
    });
    this._carruselesAdministables.get().subscribe((res: any) => {
      console.log('carruseles administrables', res);
      res.carruseles.forEach(element => {
        if(!!element.productosCarousel) {
          const arr_prods = [];
          element.productosCarousel.forEach(prod => {
            if(!!prod.producto) arr_prods.push(prod)
          });
          element.productosCarousel = arr_prods;
          this.listaCarruselesAdministrables.push(element)
        };
      });
      // this.listaCarruselesAdministrables = res.carruseles;
      setTimeout(() => {
        for (let i = 0; i < this.listaCarruselesAdministrables.length; i++) {
          console.log(`#cadministrable${i}`);
          $(`#cadministrable${i}`).owlCarousel({
            autoplay: true,
            autoplayHoverPause: true,
            items: true,
            // rtl: true,
            dots: true,
            loop: true,
            navText: [
              '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
              '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
            ],
            responsive: {
              0: {
                items: 2,
                nav: false,
              },
              600: {
                items: 3,
                nav: false,
              },
              1000: {
                items: 5,
                nav: true,
                loop: false,
              },
            },
          });
        }
      }, 100);
    });
    this._productoService
      .getByEstiloVida('Lo más local')
      .subscribe((res2: any) => {
        //   this.ProductosMasLocal = res2.productos;
        for (let index = 0; index < 7; index++) {
          if (index < res2.productos.length) {
            this.ProductosMasLocal.push(res2.productos[index]);
          }
        }
      });
    this._carrouselService.get().subscribe((res: any) => {
      this.listaCarrouseles = res.carrouseles;
    });
  }
  init() {
    $('#clocal').owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      items: true,
      // rtl: true,
      dots: true,
      loop: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      responsive: {
        0: {
          items: 2,
          nav: true,
        },
        600: {
          items: 2,
          nav: false,
        },
        320: {
          items: 2,
          nav: false,
        },
        1000: {
          items: 5,
          nav: true,
          loop: false,
        },
      },
    });

    $('#crecimendado').owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      items: true,
      // rtl: true,
      dots: true,
      loop: true,
      nav: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      responsive: {
        0: {
          items: 2,
          nav: true,
        },
        600: {
          items: 2,
          nav: true,
        },
        320: {
          items: 2,
          nav: true,
        },
        1000: {
          items: 6,
          nav: true,
          loop: false,
        },
      },
    });

    $('#cvendido2').owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      items: true,
      // rtl: true,
      dots: true,
      loop: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      responsive: {
        0: {
          items: 2,
          nav: true,
        },
        600: {
          items: 2,
          nav: false,
        },
        320: {
          items: 2,
          nav: false,
        },
        1000: {
          items: 5,
          nav: true,
          loop: false,
        },
      },
    });

    $('#cofertas').owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      items: true,
      // rtl: true,
      dots: false,
      loop: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      responsive: {
        0: {
          items: 2,
          nav: false,
        },
        600: {
          items: 2,
          nav: false,
        },
        320: {
          items: 2,
          nav: false,
        },
        1000: {
          items: 5,
          nav: true,
          loop: false,
        },
      },
    });

    $('#cvendido').owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      items: true,
      // rtl: true,
      dots: true,
      loop: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      responsive: {
        0: {
          items: 2,
          nav: true,
        },
        600: {
          items: 2,
          nav: false,
        },
        320: {
          items: 2,
          nav: false,
        },
        1000: {
          items: 5,
          nav: true,
          loop: false,
        },
      },
    });

    $('#cbolsa').owlCarousel({
      autoplay: false,
      autoplayHoverPause: true,
      items: true,
      // rtl:true,
      loop: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      dots: true,
      nav: true,
      margin: 0,
      responsive: {
        0: {
          items: 2,
        },
        1024: {
          items: 2,

          loop: false,
        },
      },
    });

    $('#cbolsa2').owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      items: true,
      // rtl: true,
      loop: true,
      navText: [
        '<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>',
        '<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>',
      ],
      responsive: {
        0: {
          items: 2,
        },
      },
    });
  }

  _getDepartamentos() {
    this._departamentosService.get().subscribe((res: any) => {
      console.log(res);
      let { departamentos } = res;

      this.departamentosURLS.alimentos_y_bebidas = departamentos.find(
        (element: any) => element.nombre === 'Alimentos y bebidas'
      )?._id;
      this.departamentosURLS.para_el_hogar = departamentos.find(
        (element: any) => element.nombre === 'Para el hogar'
      )?._id;
      this.departamentosURLS.cuidado_personal = departamentos.find(
        (element: any) => element.nombre === 'Cuidado personal'
      )?._id;
      this.departamentosURLS.eco_friendly = departamentos.find(
        (element: any) => element.nombre === 'Eco-Friendly'
      )?._id;
      this.departamentosURLS.cava = departamentos.find(
        (element: any) => element.nombre === 'Cava'
      )?._id;
      console.log(this.departamentosURLS);
    });
  }





}
