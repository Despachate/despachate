import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LAYOUT_ADMIN_ROUTES } from './layout-admin.routes';
import { LayoutAdminComponent } from './layout-admin.component';
import { ComponentsModule } from '../../components/components.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ProductosComponent } from '../layout-admin/productos/productos.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { CuponesComponent } from './cupones/cupones.component';
import { VentasComponent } from './ventas/ventas.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { CarrouselPrincipalComponent } from './carrousel-principal/carrousel-principal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { SubcategoriasComponent } from './subcategorias/subcategorias.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { EmpaqueComponent } from './empaque/empaque.component';
import { OfertasComponent } from './ofertas/ofertas.component';
import { DonacionesComponent } from './donaciones/donaciones.component';
import { InventarioComponent } from './inventario/inventario.component';
import { CarruselesComponent } from './carruseles/carruseles.component';
import { CarruselProductosComponent } from './carrusel-productos/carrusel-productos.component';
import { RecetasCategoriasComponent } from './recetas-categorias/recetas-categorias.component';
import { RecetasComponent } from './recetas/recetas.component';
import { RecetasIngredientesComponent } from './recetas-ingredientes/recetas-ingredientes.component';
import { RecetasPasosComponent } from './recetas-pasos/recetas-pasos.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CuponesDescuentosComponent } from './cupones-descuentos/cupones-descuentos.component';
import { CuponesDescuentosUsosComponent } from './cupones-descuentos-usos/cupones-descuentos-usos.component';
import { EmpresasComponent } from './empresas/empresas.component';

@NgModule({
  declarations: [
    LayoutAdminComponent,
    UsuariosComponent,
    ProductosComponent,
    DepartamentosComponent,
    CuponesComponent,
    VentasComponent,
    PedidosComponent,
    CarrouselPrincipalComponent,
    CategoriasComponent,
    SubcategoriasComponent,
    EmpaqueComponent,
    OfertasComponent,
    DonacionesComponent,
    InventarioComponent,
    CarruselesComponent,
    CarruselProductosComponent,
    RecetasCategoriasComponent,
    RecetasComponent,
    RecetasIngredientesComponent,
    RecetasPasosComponent,
    CuponesDescuentosComponent,
    EmpresasComponent,
    CuponesDescuentosUsosComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ComponentsModule,
    LAYOUT_ADMIN_ROUTES,
    NgxPaginationModule,
    DataTablesModule,
  ],
  exports: [LayoutAdminComponent],
})
export class LayoutAdminModule {}
