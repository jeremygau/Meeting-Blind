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

const routes: Routes = [
  {path: '', component: DateSeekerComponent},
  {path: 'inscription', component: NewUserComponent},
  {path: 'search', canActivate: [AuthGuard], component: DateSeekerComponent},
  {path: 'users/:id', canActivate: [AuthGuard], component: SingleUserComponent},
  {path: 'profile', canActivate: [AuthGuard], component: UserViewComponent},
  {path: 'conv/:id', canActivate: [AuthGuard], component: SingleConversationComponent},
  {path: 'conv', canActivate: [AuthGuard], component: ConversationsComponent},
  {path: 'login', component: UserConnectionComponent}
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
  UserConnectionComponent
];
