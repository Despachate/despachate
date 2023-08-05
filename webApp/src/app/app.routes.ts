import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, CanActivate } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AvisoPrivacidadComponent } from './pages/aviso-privacidad/aviso-privacidad/aviso-privacidad.component';
import { TerminosCondicionesComponent } from './pages/terminos-condiciones/terminos-condiciones/terminos-condiciones.component';
import { PreguntasFrecuentesComponent } from './pages/preguntas-frecuentes/preguntas-frecuentes/preguntas-frecuentes.component';
import { AltaDireccionComponent } from './pages/alta-direccion/alta-direccion/alta-direccion.component';
import { MiSuscripcionComponent } from './pages/mi-suscripcion/mi-suscripcion/mi-suscripcion.component';
import { MiPerfilComponent } from './pages/mi-peril/mi-perfil/mi-perfil.component';
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
import { UserGuard } from './services/guards/user.guard';
import { CompraExitosaComponent } from './pages/compra-exitosa/compra-exitosa.component';
import { CompraNoExitosaComponent } from './pages/compra-no-exitosa/compra-no-exitosa.component';
import { RecetasComponent } from './pages/recetas/recetas.component';
import { RecetaComponent } from './pages/receta/receta.component';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';
import { MisListasSuperComponent } from './pages/mis-listas-super/mis-listas-super.component';
import { GiftCardComponent } from './pages/gift-card/gift-card.component';
import { SuccessGiftCardComponent } from './pages/success-gift-card/success-gift-card.component';
import { MisListasDatosEntregaComponent } from './pages/mis-listas-datos-entrega/mis-listas-datos-entrega.component';
const routes: Routes = [
  /* canActivate: [UserGuard], */
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'privacidad', component: AvisoPrivacidadComponent },
  { path: 'terminos', component: TerminosCondicionesComponent },
  { path: 'preguntas', component: PreguntasFrecuentesComponent },
  {
    path: 'altaDireccion',
    canActivate: [UserGuard],
    component: AltaDireccionComponent,
  },
  { path: 'miPerfil', canActivate: [UserGuard], component: MiPerfilComponent },
  {
    path: 'miSuscripcion',
    canActivate: [UserGuard],
    component: MiSuscripcionComponent,
  },
  { path: 'registrarse', component: RegistrarseComponent },
  { path: 'login', component: LoginComponent },
  { path: 'miCuenta', canActivate: [UserGuard], component: MiCuentaComponent },
  {
    path: 'misFavoritos',
    canActivate: [UserGuard],
    component: MisFavoritosComponent,
  },
  {
    path: 'pagoExitoso',
    canActivate: [UserGuard],
    component: PagoExitosoComponent,
  },
  {
    path: 'datosEntrega',
    canActivate: [UserGuard],
    component: DatosEntregaComponent,
  },
  {
    path: 'datosEntrega/:type',
    canActivate: [UserGuard],
    component: DatosEntregaComponent,
  },
  { path: 'carrito', component: CarritoComponent },
  { path: 'recomiendaGana', component: RecomiendaGanaComponent },
  { path: 'uneteBolsa', component: UneteBolsaComponent },
  {
    path: 'miSuscricpcionInfografia',
    component: MiSuscripcionInfografiaComponent,
  },
  { path: 'conocenos', component: ConocenosComponent },
  { path: 'producto/:id', component: ProductoComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'catalogo/:idDepto/:idCat/:idSubCat', component: CatalogoComponent },
  { path: 'catalogo/:estiloVida', component: CatalogoComponent },
  { path: 'compraExitosa', component: CompraExitosaComponent },
  { path: 'compraNoExitosa', component: CompraNoExitosaComponent },
  { path: 'recetas', component: RecetasComponent },
  { path: 'receta/:nombre/:receta', component: RecetaComponent },

  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
  { path: 'giftCard', component: GiftCardComponent },
  { path: 'successGiftCard', component: SuccessGiftCardComponent },
  { path: 'misListasSuper', component: MisListasSuperComponent },
  { path: 'misListasSuperDatosEntrega/:idLista', component: MisListasDatosEntregaComponent },
];
export const APP_ROUTES = RouterModule.forRoot(routes, {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload',
});
