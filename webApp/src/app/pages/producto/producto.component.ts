import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../services/productos/productos.service';
import { URL_IMGS } from 'src/environments/environment';
import { FavoritosService } from 'src/app/services/favoritos/favoritos.service';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { Router } from '@angular/router';
import { SuscripcionService } from '../../services/suscripciones/suscripcion.service';
import { CarritoSuscripcionService } from '../../services/carrito-suscripcion/carrito-suscripcion.service';
import { ToastService } from '../../services/toast/toast.service';
import { InventarioService } from 'src/app/services/inventario/inventario.service';
import { OfertaService } from '../../services/oferta/oferta.service';
import { EmpaquesService } from 'src/app/services/empaques/empaques.service';
import { DireccionService } from 'src/app/services/direcciones/direccion.service';
declare var $;

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  producto: any = {};
  _precio: number = 0;

  paquetes: any[] = [];
  _paquete: any = {};

  productosRelacionados: any [] = [];
  url: string = `${URL_IMGS}productos/`;
  precioAnterior: number = 0;
  isFavorito: boolean = false;
  _favorito: any = {};

  _cantidad: number = 1;
  idCarritoSus: string;
  datosUsuario: any[] = [];

  idDpto: any = {};
  idCat: any = {};
  idSubCat: any = {} ;



  ///SUSCRIPCION
  metodo: string = 'Efectivo';
  contacto: string = "Whatsapp";
  contactar: string = 'si';
  empaque: string = '';
  empaqueSeleccionado:any = {};
  _cantidadBolsa: number = 1;
  fechaEntrega: string = "cada Semana";
  horaEntrega: string = "9:00am-11:00am";
  direccion: string = null;
  diaRecepcion: string = "Lunes";
  listaDirecciones: any[] = [];
  // datosUsuario: any[] = [];
  datosCarritoSuscripcion = {};
  // idCarritoSus: string;

  @ViewChild('Descripcion') _descripcion: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private _productoService:ProductosService,
    private _favoritoService: FavoritosService,
    private _usuariosService: UsuariosService,
    private _carritoService: CarritoService,
    private _suscripcionService: SuscripcionService,
    private _carritoSuscripcion: CarritoSuscripcionService,
    private _toastService: ToastService,
    private _inventarioService: InventarioService,
    private _ofertaService: OfertaService,
    private _empaqueService: EmpaquesService,
    private _direccionService: DireccionService,
    private router:Router
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe((res:any)=>{
     this.getDatos(true);
    });
    this.getDatos();
    

  }
  getDatos(flag=false){
    this.producto = {};
    this._precio = 0;
    this.paquetes = [];
    this._paquete = {};
    this.precioAnterior = 0;
    let id = this.route.snapshot.params.id;
    this._productoService.getById(id).subscribe((res:any)=>{
      this.producto = res.producto;
      console.log("datos productos",this.producto);
      this.getFavoritos();
      this.getDescripcion();
      this.idDpto = this.producto.departamento != null ? this.producto.departamento:{};
      this.idCat = this.producto.categoria != null ? this.producto.categoria:{};
      this.idSubCat = this.producto.subcategoria != null ? this.producto.subcategoria:{};
      this._inventarioService.getById(this.producto._id).subscribe((res:any)=>{
        this.paquetes = res.inventario;
        this.paquetes.length > 0 ? this.seleccionPaquete(0):false;
        console.log(res);
      })
      if(!flag){
        this._productoService.getByIdSubcat(this.producto.subcategoria._id).subscribe((res:any)=>{
          for (let index = 0; index < 7; index++) {
            if(index < res.productos.length){
              this.productosRelacionados.push(res.productos[index]);
            }       
          }
          setTimeout(() => {
            $('#cvendido2').owlCarousel({
              autoplay: true,
              autoplayHoverPause: true,
              items: true,
              rtl: true,
              dots: true,
              loop: true,
              navText : ['<i class="fa fa-angle-right fa-2x" aria-hidden="true"></i>','<i class="fa fa-angle-left fa-2x" aria-hidden="true"></i>'],
              responsive: {
                  0: {
                      items: 1,
                      nav: true
                  },
                  600: {
                      items: 1,
                      nav: false
                  },
                  320: {
                      items: 1,
                      nav: false
                  },
                  1000: {
                      items: 4,
                      nav: true,
                      loop: false
                  }
              }
          });
          }, 1000);
        });
      }
    });
    if(this._usuariosService.estaLogueado()){
      this.datosUsuario.push(JSON.parse(localStorage.getItem('usuario')));
      this._carritoSuscripcion.UsuarioSuscripcion(this.datosUsuario[0]._id).subscribe((res:any)=>{
        console.log(res);
        this.idCarritoSus = res.carrito ? res.carrito._id:'';
      });
    }
  }
  getFavoritos(){
    let usuario = this._usuariosService.usuario;
      if(usuario  !== null){
        this._favoritoService.getProductosFavoritos(this.producto._id, usuario._id).subscribe( (res:any) => {
          console.log(res);
          if(res.favorito){
            this.isFavorito = true;
            this._favorito = res.favorito;
          }else{
            this.isFavorito = false;
          }
          console.log(this.isFavorito);
        });
      }
  }

  favorito(){
    let usuario = this._usuariosService.usuario;
    if(usuario != null){
      if(this.isFavorito){
        this._favoritoService.delete(this._favorito._id).subscribe((res:any)=>{
          console.log(res);
          this._favoritoService._toastService.showNotification('top','center','success','Se quito correctamente de tus favoritos');
          this.getFavoritos();
        });
      }else{
        this._favoritoService.insert({producto: this.producto._id, usuario}).subscribe( (res:any) => {
          console.log(res);
          this._favoritoService._toastService.showNotification('top','center','success','Se agrego correctamente a tus favoritos');
          this.getFavoritos();
        });
      }
    }else{
      this._favoritoService._toastService.showNotification('top','center','danger','No has iniciado sesión');
    }
  }

  addCarrito(){
    if (this.producto.status != 'Agotado') {
      if(this._cantidad <= this._paquete.stock){
        this._ofertaService.getXProducto(this.producto._id).subscribe((res:any)=>{
          if(res.oferta){
            if(this._paquete._id === res.oferta.inventario._id){
              this._paquete.precio = res.oferta.precio
              this._toastService.showNotification('top','center','success','Este producto tiene oferta');
              this._carritoService.agregarAlCarrito(this.producto,this._cantidad, this._paquete, res.oferta.precio);
            }else{
              this._carritoService.agregarAlCarrito(this.producto,this._cantidad, this._paquete);
            }
          }else{
            this._carritoService.agregarAlCarrito(this.producto,this._cantidad, this._paquete);
          }
        });
        
      }else{
        this._toastService.showNotification('top','center','warning','No hay inventario para este producto');
      }
    } else {
      this._toastService.showNotification('top','center','warning','Este producto se encuentra agotado'); 
    }
   
  }
  addSuscripcion(){
    if (this.producto.status != 'Agotado') {
      let usuario = this._usuariosService.usuario;
      if(usuario != null && usuario._id){
        this._carritoSuscripcion.UsuarioSuscripcion(usuario._id).subscribe((res1:any)=>{
          if(res1.existe){
            if(this._cantidad <= this._paquete.stock){
              this.agregarASuscripcion()
            }else{
              this._toastService.showNotification('top','center','warning','No hay inventario para este producto');
            }
          }else{
            // this._toastService.showNotification('top','center','warning','Registra tus datos para poder agregar productos a tu suscripción');
            // this.router.navigate(['/miSuscripcion']);
            this.registrarSuscripcion();
          }
        });
      }else{
        this._toastService.showNotification('top','center','warning','Inicia sesión para poder agregar productos a tu suscripción');
      }
    } else {
      this._toastService.showNotification('top','center','warning','Este producto se encuentra agotado'); 
    }
  }
  getDescripcion(){
    // console.log(this.producto.descripcion.replace('\n\n','<br>'));
    this._descripcion.nativeElement.innerHTML = this.producto.descripcion.replace(/\n/g, "<br />");
  }
  cantidad(sum:boolean){
    if(sum){
      if(this._cantidad<this._paquete.stock){
        this._cantidad++;
        this._precio = Math.round(((this._paquete.precio * this._cantidad) + Number.EPSILON) * 100) / 100;

       
      }else{
        this._toastService.showNotification('top','center','warning','No hay inventario suficiente para este producto');
      }
    }else{
      if(this._cantidad > 1){
        this._cantidad--;
        this._precio = Math.round(((this._paquete.precio * this._cantidad) + Number.EPSILON) * 100) / 100;
      }else{
        this._productoService._toastService.showNotification('top','center','warning','No se puede seleccionar menos de un producto');
      }
    }
  }

  agregarASuscripcion(){
    let detalleProducto : any [] = [];
    this._suscripcionService.getProducto(this.idCarritoSus,this._paquete._id).subscribe((res:any)=>{
      detalleProducto.push(res.detalleSus);
      console.log(res);
      if(res.existe){
        detalleProducto[0].cantidad += this._cantidad;
        detalleProducto[0].subtotal = Math.round((detalleProducto[0].cantidad*this._paquete.precio)*100)/100;
        this._suscripcionService.update(detalleProducto[0]._id,detalleProducto[0]).subscribe((res:any)=>{
          // console.log(res);
          this._productoService._toastService.showNotification('top','center','success','Se modifico la cantidad del producto');
        });
      }else{
        let subtotal = Math.round((this._cantidad*this._paquete.precio)*100)/100;
        let datosDetalleSuscripcion = {
          cantidad:this._cantidad,
          subtotal: subtotal,
          carritoSuscripcion: this.idCarritoSus,
          producto: this.producto._id,
          paquete: this._paquete._id
        };
        this._suscripcionService.insert(datosDetalleSuscripcion).subscribe((res2:any)=>{
          this._toastService.showNotification('top','center','success','Producto agregado a tu suscripción Correctamente');
        });
      }
    })
  }
  registrarSuscripcion(){
    let idUser = this._usuariosService.usuario._id;
    this._direccionService.getDireccionesxUsuario(idUser).subscribe((res: any)=>{
      this.listaDirecciones = res;
      if(res.length > 0){
        this.direccion = res[0]._id;
        this._empaqueService.get().subscribe((res:any)=>{
          this.empaque = res.empaques[0]._id;
          let datosCarritoSuscripcion = {
            frecuenciaEntrega : this.fechaEntrega,
            horarioEntrega : this.horaEntrega,
            diaRecepcion : this.diaRecepcion,
            contacto : this.contactar === 'si' ? true:false ,
            formaContacto : this.contacto,
            metodoPago : this.metodo,
            referenciaPago: "Suscripción",
            precioTotal:0,
            cantidadTotal:0,
            direccion : this.direccion,
            empaque : this.empaque,
            cantidadEmpaques: this._cantidadBolsa,
            usuario: idUser 
          };
          this._carritoSuscripcion.insert(datosCarritoSuscripcion).subscribe((res:any)=>{
            this.idCarritoSus = res.carrito._id;
            this._toastService.showNotification("top","center","success","Se ha creado tu suscripción exitosamente, ahora puedes agregar productos");
            this.agregarASuscripcion();
          });
        });
      }else{
        this._toastService.showNotification('top','center','warning','Registra tus datos de dirección de envío para poder agregar productos a tu suscripción');
        this.router.navigate(['/miCuenta']);
      }
    });
  }
  seleccionPaquete(index:number){
    this._paquete = this.paquetes[index];
    this._precio = this._paquete.precio;
    this._cantidad = 1;
    this._ofertaService.getXProducto(this.producto._id).subscribe((reso:any)=>{
      if(reso.oferta){
        console.log(reso.oferta);
        if(this._paquete.stock > 0){
          //this._toastService.showNotification('top','center','success','Este producto tiene oferta');
          
            if (this._paquete._id === reso.oferta.inventario._id){
              this._paquete = this._paquete;
              this.precioAnterior= this._paquete.precio;
              this._precio = reso.oferta.precio;
            }
         
        }else{
        }
      }else{
      }
      
    });
  }

}
