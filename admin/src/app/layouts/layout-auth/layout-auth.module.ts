import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutAuthComponent } from './layout-auth.component';
import { LAYOUT_AUTH_ROUTES } from './layout-auth.routes';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    LayoutAuthComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    LAYOUT_AUTH_ROUTES,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    LayoutAuthComponent
  ]

})
export class LayoutAuthModule { }
