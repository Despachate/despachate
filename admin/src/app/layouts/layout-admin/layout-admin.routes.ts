import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { LayoutAdminComponent } from './layout-admin.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ProductosComponent } from '../layout-admin/productos/productos.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { CuponesComponent } from './cupones/cupones.component';
import { VentasComponent } from './ventas/ventas.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { CarrouselPrincipalComponent } from './carrousel-principal/carrousel-principal.component';
import { SubcategoriasComponent } from './subcategorias/subcategorias.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { EmpaqueComponent } from './empaque/empaque.component';
import { OfertasComponent } from './ofertas/ofertas.component';
import { DonacionesComponent } from './donaciones/donaciones.component';
import { AdminGuard } from 'app/services/guards/admin.guard';
import { InventarioComponent } from './inventario/inventario.component';
import { CarruselesComponent } from './carruseles/carruseles.component';
import { CarruselProductosComponent } from './carrusel-productos/carrusel-productos.component';
import { RecetasComponent } from './recetas/recetas.component';
import { RecetasPasosComponent } from './recetas-pasos/recetas-pasos.component';
import { RecetasIngredientesComponent } from './recetas-ingredientes/recetas-ingredientes.component';
import { RecetasCategoriasComponent } from './recetas-categorias/recetas-categorias.component';
import { CuponesDescuentosComponent } from './cupones-descuentos/cupones-descuentos.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { CuponesDescuentosUsosComponent } from './cupones-descuentos-usos/cupones-descuentos-usos.component';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AdminGuard],
    component: LayoutAdminComponent,
    children: [
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'departamentos', component: DepartamentosComponent },
      { path: 'cupones', component: CuponesComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'pedidos/:id', component: PedidosComponent },
      { path: 'carrousel', component: CarrouselPrincipalComponent },
      { path: 'carruseles', component: CarruselesComponent },
      { path: 'carruselproductos/:id', component: CarruselProductosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'subcategorias', component: SubcategoriasComponent },
      { path: 'empaques', component: EmpaqueComponent },
      { path: 'ofertas', component: OfertasComponent },
      { path: 'donaciones', component: DonacionesComponent },
      { path: 'inventario/:idProd', component: InventarioComponent },
      { path: 'recetas', component: RecetasComponent },
      {
        path: 'recetas-pasos/:receta/:receta_nombre',
        component: RecetasPasosComponent,
      },
      {
        path: 'recetas-ingredientes/:receta/:receta_nombre',
        component: RecetasIngredientesComponent,
      },
      { path: 'recetas-categorias', component: RecetasCategoriasComponent },
      { path: 'cupones-descuentos', component: CuponesDescuentosComponent },
      {
        path: 'cupones-descuentos-usos',
        component: CuponesDescuentosUsosComponent,
      },
      { path: 'empresas', component: EmpresasComponent },

      { path: '', pathMatch: 'full', redirectTo: 'ventas' },
    ],
  },
];

export const LAYOUT_ADMIN_ROUTES = RouterModule.forChild(routes);
