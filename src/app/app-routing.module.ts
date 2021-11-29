import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GeneratorComponent } from './generator/generator.component';
import { LoadingComponent } from './loading/loading.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: "", component: LoginComponent},
  { path: "generator", component: GeneratorComponent},
  { path: "loading", component: LoadingComponent},
  { path: "success", component: SuccessComponent},
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ]
})
export class AppRoutingModule { }
