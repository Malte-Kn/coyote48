import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OptionalComponent } from './optional/optional.component';
import { HomeComponent } from './home/home.component';
import { ResultComponent } from './result/result.component';


const routes: Routes = [ 
  { path: '', component: HomeComponent},
  { path: 'optional', component: OptionalComponent} ,
  { path: 'result', component: ResultComponent},
  { path: '**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
