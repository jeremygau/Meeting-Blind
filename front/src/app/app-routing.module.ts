import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DateSeekerComponent } from './date-seeker/date-seeker.component';

const routes: Routes = [
  {path: 'search', component: DateSeekerComponent},
  // {path:'search/:id', component: SingleUserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routedComponents = [
  DateSeekerComponent
];
