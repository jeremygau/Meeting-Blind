import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewUserComponent } from './new-user/new-user.component';
import { DateSeekerComponent } from './date-seeker/date-seeker.component';
import { SingleUserComponent } from './single-user/single-user.component';
import { SingleConversationComponent } from './single-conversation/single-conversation.component';
import {ConversationsComponent} from './conversations/conversations.component';

const routes: Routes = [
  {path: '', component: DateSeekerComponent},
  {path: 'inscription', component: NewUserComponent},
  {path: 'search', component: DateSeekerComponent},
  {path: 'users/:id', component: SingleUserComponent},
  {path: 'conv/:id', component: SingleConversationComponent},
  {path: 'conv/', component: ConversationsComponent}
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
  ConversationsComponent
];
