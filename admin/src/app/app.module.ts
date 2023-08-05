import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { RouterModule } from '@angular/router';

// import { AppRoutingModule, APP_ROUTES } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import { AgmCoreModule } from '@agm/core';
import { APP_ROUTES } from './app.routing';
import { LayoutAuthModule } from './layouts/layout-auth/layout-auth.module';
import { LayoutAdminModule } from './layouts/layout-admin/layout-admin.module';
import { BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    APP_ROUTES,
    LayoutAuthModule,
    LayoutAdminModule,
    NgxPaginationModule,
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    }),
    BlockUIModule.forRoot(),
    BlockUIHttpModule.forRoot({
      blockAllRequestsInProgress: true,
    }),
  ],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
