import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { APP_ROUTES } from './app.routes';
import { HomeComponent } from './pages/home/home.component';
import { CardProductoComponent } from './components/card-producto/card-producto.component';
import { HttpClientModule } from '@angular/common/http';
import { AvisoPrivacidadComponent } from './pages/aviso-privacidad/aviso-privacidad/aviso-privacidad.component';
import { TerminosCondicionesComponent } from './pages/terminos-condiciones/terminos-condiciones/terminos-condiciones.component';
import { PreguntasFrecuentesComponent } from './pages/preguntas-frecuentes/preguntas-frecuentes/preguntas-frecuentes.component';
import { AltaDireccionComponent } from './pages/alta-direccion/alta-direccion/alta-direccion.component';
import { MiPerfilComponent } from './pages/mi-peril/mi-perfil/mi-perfil.component';
import { MiSuscripcionComponent } from './pages/mi-suscripcion/mi-suscripcion/mi-suscripcion.component';
import { RegistrarseComponent } from './pages/registrarse/registrarse/registrarse.component';
import { LoginComponent } from './pages/login/login.component';
import { MiCuentaComponent } from './pages/mi-cuenta/mi-cuenta.component';
import { MisFavoritosComponent } from './pages/mis-favoritos/mis-favoritos.component';
import { PagoExitosoComponent } from './pages/pago-exitoso/pago-exitoso.component';
import { DatosEntregaComponent } from './pages/datos-entrega/datos-entrega.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { RecomiendaGanaComponent } from './pages/recomienda-gana/recomienda-gana.component';
import { UneteBolsaComponent } from './pages/unete-bolsa/unete-bolsa.component';
import { MiSuscripcionInfografiaComponent } from './pages/mi-suscripcion-infografia/mi-suscripcion-infografia.component';
import { ConocenosComponent } from './pages/conocenos/conocenos.component';
import { ProductoComponent } from './pages/producto/producto.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { CompraExitosaComponent } from './pages/compra-exitosa/compra-exitosa.component';
import { CompraNoExitosaComponent } from './pages/compra-no-exitosa/compra-no-exitosa.component';
import { BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardRecetaComponent } from './components/card-receta/card-receta.component';
import { RecetasComponent } from './pages/recetas/recetas.component';
import { RecetaComponent } from './pages/receta/receta.component';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';
// import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { MisListasSuperComponent } from './pages/mis-listas-super/mis-listas-super.component';
import { GiftCardComponent } from './pages/gift-card/gift-card.component';
import { SuccessGiftCardComponent } from './pages/success-gift-card/success-gift-card.component';
import { MisListasDatosEntregaComponent } from './pages/mis-listas-datos-entrega/mis-listas-datos-entrega.component';
import { AddListaModalComponent } from './components/shared/footer/components/add-lista-modal/add-lista-modal.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    CardProductoComponent,
    AvisoPrivacidadComponent,
    TerminosCondicionesComponent,
    PreguntasFrecuentesComponent,
    AltaDireccionComponent,
    MiPerfilComponent,
    MiSuscripcionComponent,
    RegistrarseComponent,
    LoginComponent,
    MiCuentaComponent,
    MisFavoritosComponent,
    PagoExitosoComponent,
    DatosEntregaComponent,
    CarritoComponent,
    RecomiendaGanaComponent,
    UneteBolsaComponent,
    MiSuscripcionInfografiaComponent,
    ConocenosComponent,
    ProductoComponent,
    CatalogoComponent,
    CompraExitosaComponent,
    CompraNoExitosaComponent,
    CardRecetaComponent,
    RecetasComponent,
    RecetaComponent,
    SuccessComponent,
    CancelComponent,
    MisListasSuperComponent,
    GiftCardComponent,
    SuccessGiftCardComponent,
    MisListasDatosEntregaComponent,
    AddListaModalComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    BsDatepickerModule.forRoot(),
    BlockUIModule.forRoot(),
    // BlockUIHttpModule.forRoot({
    //   blockAllRequestsInProgress: true,
    // }),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    // provideFirebaseApp(() => initializeApp(firebaseConfig)),
    APP_ROUTES,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
