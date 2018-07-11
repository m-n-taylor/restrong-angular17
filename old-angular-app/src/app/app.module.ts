import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { TransferHttpModule } from '../modules/transfer-http/transfer-http.module';

// Shared Components
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
import { TermsOfUseComponent } from './shared/components/terms-of-use/terms-of-use.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { VerifyEmailComponent } from './shared/components/verify-email/verify-email.component';

// CR Modules
import { CRMainModule } from './consumer/cr-main/cr-main.module';
import { CRMainDashboardModule } from './consumer/cr-main-dashboard/cr-main-dashboard.module';

// CR Components
import { CRMainComponent } from './consumer/cr-main/cr-main.component';
import { CRMainDashboardComponent } from './consumer/cr-main-dashboard/cr-main-dashboard.component';
import { HomeComponent } from './consumer/home/home.component';
import { SEOCuisineListComponent } from './consumer/seo-cuisine-list/seo-cuisine-list.component';
import { SEODishListComponent } from './consumer/seo-dish-list/seo-dish-list.component';
import { SEOMenuItemListComponent } from './consumer/seo-menu-item-list/seo-menu-item-list.component';
import { SearchComponent } from './consumer/search/search.component';
import { MenuComponent } from './consumer/menu/menu.component';
import { LoginComponent } from './consumer/login/login.component';
import { CheckoutComponent } from './consumer/checkout/checkout.component';
import { RegisterComponent } from './consumer/register/register.component';
import { PastOrdersComponent } from './consumer/past-orders/past-orders.component';
import { MenuMapViewComponent } from './consumer/menu-map-view/menu-map-view.component';
import { RestMapViewComponent } from './consumer/rest-map-view/rest-map-view.component';
import { UserPaymentsComponent } from './consumer/user-payments/user-payments.component';
import { UserAddressesComponent } from './consumer/user-addresses/user-addresses.component';
import { ResetPasswordComponent } from './consumer/reset-password/reset-password.component';
import { ChangePasswordComponent } from './consumer/change-password/change-password.component';
import { ForgotPasswordComponent } from './consumer/forgot-password/forgot-password.component';
import { PastOrderDetailsComponent } from './consumer/past-order-details/past-order-details.component';
import { RestaurantDetailsComponent } from './consumer/restaurant-details/restaurant-details.component';

// RO Modules
import { ROMainModule } from './rest-owner/ro-main/ro-main.module';
import { ROMainDashboardModule } from './rest-owner/ro-main-dashboard/ro-main-dashboard.module';

// RO Components
import { ROMainComponent } from './rest-owner/ro-main/ro-main.component';
import { ROMainDashboardComponent } from './rest-owner/ro-main-dashboard/ro-main-dashboard.component';

// Shared Services
import { PathService as Path } from './shared/services/path.service';
import { CanDeactivateGuard } from './shared/services/can-deactivate-guard.service';

// Shared Helpers
import { Util } from './shared/util';
import { Constants } from './shared/constants';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        TransferHttpModule,
        ROMainModule,
        ROMainDashboardModule,
        CRMainModule,
        CRMainDashboardModule,
        RouterModule.forRoot([
            {
                path: '', component: CRMainComponent, children: [
                    { path: '', component: HomeComponent },
                    { path: 'restaurant/:cuisine/:name/:id', component: RestaurantDetailsComponent },

                    {
                        path: '', component: CRMainDashboardComponent, children: [
                            // { path: 'search', component: SearchComponent },
                            // { path: 'menu', component: MenuComponent },
                            // { path: 'menu-map-view', component: MenuMapViewComponent },
                            // { path: 'rest-map-view', component: RestMapViewComponent },
                            // { path: 'checkout', component: CheckoutComponent },
                            // { path: 'user-addresses', component: UserAddressesComponent },
                            // { path: 'user-payments', component: UserPaymentsComponent },
                            // { path: 'past-orders', component: PastOrdersComponent },
                            // { path: 'past-orders/:id', component: PastOrderDetailsComponent },
                        ]
                    },
                    // { path: 'login', component: LoginComponent },
                    // { path: 'signup', component: RegisterComponent },
                    { path: 'verify-email/:id', component: VerifyEmailComponent },
                    { path: 'reset-password', component: ResetPasswordComponent },
                    { path: 'reset-password/:id', component: ResetPasswordComponent },
                    // { path: 'forgot-password', component: ForgotPasswordComponent },
                    // { path: 'change-password', component: ChangePasswordComponent },

                    { path: 'terms-of-use', component: TermsOfUseComponent },
                    { path: '404', component: PageNotFoundComponent },

                    // Routes are very `Dynamic` should defined at last, so other routes get chance to `match` first
                    // TODO: not needed { path: ':serviceType/:city', component: ZipDetailsComponent },
                    { path: 'delivery/:city', component: SEOCuisineListComponent },
                    { path: 'pick-up/:city', component: SEOCuisineListComponent },
                    { path: 'catering/:city', component: SEOCuisineListComponent },
                    { path: 'dine-in/:city', component: SEOCuisineListComponent },

                    { path: 'delivery/:city/:zipcode', component: SEOCuisineListComponent },
                    { path: 'pick-up/:city/:zipcode', component: SEOCuisineListComponent },
                    { path: 'catering/:city/:zipcode', component: SEOCuisineListComponent },
                    { path: 'dine-in/:city/:zipcode', component: SEOCuisineListComponent },

                    { path: 'delivery/:city/:zipcode/:cuisine/page/:page', component: SEOCuisineListComponent },
                    { path: 'pick-up/:city/:zipcode/:cuisine/page/:page', component: SEOCuisineListComponent },
                    { path: 'catering/:city/:zipcode/:cuisine/page/:page', component: SEOCuisineListComponent },
                    { path: 'dine-in/:city/:zipcode/:cuisine/page/:page', component: SEOCuisineListComponent },

                    { path: 'delivery/:city/:zipcode/:cuisine/:dish/page/:page', component: SEOMenuItemListComponent },
                    { path: 'pick-up/:city/:zipcode/:cuisine/:dish/page/:page', component: SEOMenuItemListComponent },
                    { path: 'catering/:city/:zipcode/:cuisine/:dish/page/:page', component: SEOMenuItemListComponent },
                    { path: 'dine-in/:city/:zipcode/:cuisine/:dish/page/:page', component: SEOMenuItemListComponent },

                    { path: '**', redirectTo: '/404' },
                ]
            },
        ])
    ],
    declarations: [
        AppComponent,
        ROMainComponent,
        ROMainDashboardComponent,
        CRMainComponent,
        CRMainDashboardComponent,
    ],
    exports: [AppComponent],
    providers: [
        Constants,
        CanDeactivateGuard,
    ]
})
export class AppModule { }