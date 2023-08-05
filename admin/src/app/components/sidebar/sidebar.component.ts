import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  // { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
  // { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
  // { path: '/table-list', title: 'Table List',  icon:'content_paste', class: '' },
  // { path: '/typography', title: 'Typography',  icon:'library_books', class: '' },
  // { path: '/icons', title: 'Icons',  icon:'bubble_chart', class: '' },
  // { path: '/maps', title: 'Maps',  icon:'location_on', class: '' },
  // { path: '/notifications', title: 'Notifications',  icon:'notifications', class: '' },
  { path: '/admin/usuarios', title: 'Usuarios', icon: 'person', class: '' },
  {
    path: '/admin/departamentos',
    title: 'Departamentos',
    icon: 'view_compact',
    class: '',
  },
  { path: '/admin/productos', title: 'Productos', icon: 'fastfood', class: '' },
  {
    path: '/admin/cupones',
    title: 'Cupones',
    icon: 'local_activity',
    class: '',
  },
  {
    path: '/admin/cupones-descuentos',
    title: 'Nuevos Cupones',
    icon: 'local_activity',
    class: '',
  },
  {
    path: '/admin/ventas',
    title: 'Ventas',
    icon: 'monetization_on',
    class: '',
  },
  {
    path: '/admin/carrousel',
    title: 'Administrar Carrusel',
    icon: 'burst_mode',
    class: '',
  },
  {
    path: '/admin/carruseles',
    title: 'Carruseles',
    icon: 'burst_mode',
    class: '',
  },
  {
    path: '/admin/empaques',
    title: 'Empaque ',
    icon: 'shopping_bag',
    class: '',
  },
  {
    path: '/admin/ofertas',
    title: 'Ofertas ',
    icon: 'monetization_on',
    class: '',
  },
  {
    path: '/admin/donaciones',
    title: 'Donaciones ',
    icon: 'redeem',
    class: '',
  },
  {
    path: '/admin/recetas-categorias',
    title: 'Categorias de recetas',
    icon: 'list',
    class: '',
  },
  { path: '/admin/recetas', title: 'Recetas', icon: 'fastfood', class: '' },
  { path: '/admin/empresas', title: 'Empresas', icon: 'business', class: '' },

  // { path: '/upgrade', title: 'Upgrade to PRO',  icon:'unarchive', class: 'active-pro' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
}
