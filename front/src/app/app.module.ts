import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DateSeekerComponent } from './date-seeker/date-seeker.component';
import { DateListComponent } from './date-list/date-list.component';
import { HttpService } from './services/http.service';

@NgModule({
  declarations: [
    AppComponent,
    DateSeekerComponent,
    DateListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    HttpService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
