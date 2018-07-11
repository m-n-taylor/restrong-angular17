import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { isBrowser } from 'angular2-universal';

import { MainModule } from './main/main.module';
import { HomeModule } from './home/home.module';
import { MenuModule } from './menu/menu.module';
import { LoginModule } from './login/login.module';
import { SearchModule } from './search/search.module';
import { RegisterModule } from './register/register.module';
import { MenuMapViewModule } from './menu-map-view/menu-map-view.module';
import { RestaurantDetailsModule } from './restaurant-details/restaurant-details.module';
import { ShoppingCartModalModule } from './shared/components/shopping-cart-modal/shopping-cart-modal.module';

import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, XLargeDirective } from './app.component';

// Added code from `angular2-social-login` (had issues installing from npm)
import { Angular2SocialLoginModule } from "./shared/components/social-login/angular2-social-login.module";


let providers = {
  "google": {
    "clientId": "975536833030-qp3hcn2drdt6c761r8bv0of67mn31nsj.apps.googleusercontent.com"
  },
  // "linkedin": {
  //   "clientId": "LINKEDIN_CLIENT_ID"
  // },
  "facebook": {
    "clientId": "1819446761653920",
    "apiVersion": "v2.4" //like v2.4 
  }
};

let appModuleImports: any = [
    InfiniteScrollModule,
    SharedModule,
    LoginModule,
    LoginModule,
    RegisterModule,
    AppRoutingModule,
    MainModule,
    HomeModule,
    MenuMapViewModule
  ];

if(isBrowser) {
  appModuleImports.push(Angular2SocialLoginModule.initWithProviders(providers));
}

@NgModule({
  declarations: [AppComponent, XLargeDirective],
  imports: appModuleImports
})
export class AppModule {

  constructor() {
    // if(isBrowser) {
    //   Angular2SocialLoginModule.initWithProviders(providers);
    // }
    // var sub = this._auth.login('facebook').subscribe(
    //   (data) => {
    //     console.log('user login => ', data);
    //     //user data 
    //     //name, image, uid, provider, uid, email, token (returns tokenId for google, accessToken for Facebook, no token for linkedIn) 
    //   }
    // )
  }

}

export { AppComponent } from './app.component';