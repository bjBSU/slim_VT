import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoggerDisplayComponent } from './logger-display/logger-display.component';
import { ChartRenderComponent } from './chart-render/chart-render.component';
//import { ChartRenderDataComponent } from './chart-render-data/chart-render-data.component';

@NgModule({
  declarations: [
    AppComponent,
    LoggerDisplayComponent,
    ChartRenderComponent,
    //ChartRenderDataComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
