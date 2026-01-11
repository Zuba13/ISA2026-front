import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { ManagersComponent } from './managers/managers.component';
import { ProfileComponent } from './profile/profile.component';
import { PublicProfileComponent } from './public-profile/public-profile.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'managers', component: ManagersComponent },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user-profile/:id', component: PublicProfileComponent }
];
@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ManagersComponent,
    ProfileComponent,
    PublicProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
