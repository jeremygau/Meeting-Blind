import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routedComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpService } from './services/http.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UsersComponent } from './users/users.component';
import { NotificationsService } from './services/notifications.service';
import { UserConnectionComponent } from './user-connection/user-connection.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { UserEditComponent } from './user-edit/user-edit.component';
import { LikeComponent } from './like/like.component';

@NgModule({
  declarations: [
    AppComponent,
    routedComponents,
    UsersComponent,
    UserConnectionComponent,
    UserEditComponent,
    LikeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    HttpService,
    NotificationsService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
