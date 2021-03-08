import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewUserComponent } from './new-user/new-user.component';
import { DateSeekerComponent } from './date-seeker/date-seeker.component';
import { SingleUserComponent } from './single-user/single-user.component';
import { SingleConversationComponent } from './single-conversation/single-conversation.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { UserViewComponent } from './user-view/user-view.component';
import { UserConnectionComponent } from './user-connection/user-connection.component';
import { AuthGuard } from './services/auth-guard.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { PresentationComponent } from './presentation/presentation.component';

const routes: Routes = [
  {path: '', component: PresentationComponent},
  {path: 'inscription', component: NewUserComponent},
  {path: 'search', canActivate: [AuthGuard], component: DateSeekerComponent},
  {path: 'users/:id', canActivate: [AuthGuard], component: SingleUserComponent},
  {path: 'profile', canActivate: [AuthGuard], component: UserViewComponent},
  {path: 'profile/editProfile', canActivate: [AuthGuard], component: UserEditComponent},
  {path: 'conv', canActivate: [AuthGuard], component: ConversationsComponent},
  {path: 'conv/:id', canActivate: [AuthGuard], component: SingleConversationComponent},
  {path: 'login', component: UserConnectionComponent},
  /*** Mettre les autres routes ici, les routes en dessous doivent être les dernières de la liste ***/

  {path: 'not-found', component: PageNotFoundComponent},
  {path: '**', redirectTo: 'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routedComponents = [
  DateSeekerComponent,
  NewUserComponent,
  SingleUserComponent,
  SingleConversationComponent,
  ConversationsComponent,
  UserViewComponent,
  UserConnectionComponent,
  PageNotFoundComponent,
  PresentationComponent
];
