import { NgModule } from '@angular/core';
import { GeneratorComponent } from './generator/generator.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: LoginComponent},
  { path: "generator", component: GeneratorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
