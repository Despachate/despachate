import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { LayoutAuthComponent } from './layout-auth.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [{
     path: 'auth', 
     component: LayoutAuthComponent,
     children: [
         { path: '', component: LoginComponent },
    ]
 }];


export const LAYOUT_AUTH_ROUTES = RouterModule.forChild(routes);
