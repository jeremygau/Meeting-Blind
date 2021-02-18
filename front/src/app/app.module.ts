import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routedComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpService } from './services/http.service';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { SingleUserComponent } from './single-user/single-user.component';

@NgModule({
  declarations: [
    AppComponent,
    routedComponents,
    UsersComponent,
    SingleUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    HttpService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
