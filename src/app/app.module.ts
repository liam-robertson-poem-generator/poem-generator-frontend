import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from '../environments/environment';
import { GeneratorComponent } from './generator/generator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingComponent } from './loading/loading.component';
import { SuccessComponent } from './success/success.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: "", component: LoginComponent},
  { path: "generator", component: GeneratorComponent},
  { path: "loading", component: LoadingComponent},
  { path: "success", component: SuccessComponent},
];

@NgModule({
  declarations: [   
    GeneratorComponent,
    LoginComponent,
    AppComponent,
    LoadingComponent,
    SuccessComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireStorageModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatProgressBarModule,
    MatFormFieldModule,
    AngularFireModule.initializeApp(environment.firebase),
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
