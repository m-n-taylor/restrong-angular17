import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy, HashLocationStrategy, PlatformLocation } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Router } from '@angular/router';

import { SharedModule } from '../../shared.module';

import { Constants } from '../../shared/constants';

// Shared Components
import { Ng2BreadcrumbModule, BreadcrumbService } from '../../libs/breadcrumb/breadcrumb.module';
import { VerifyEmailComponent } from "../../shared/components/verify-email/verify-email.component";
import { TermsOfUseComponent } from "../../shared/components/terms-of-use/terms-of-use.component";
import { PageNotFoundComponent } from "../../shared/components/page-not-found/page-not-found.component";
import { SupportChatBoxComponent } from '../../shared/components/support-chat-box/support-chat-box.component';

// Shared Pipes
import { UnMaskCardNoPipe } from "../../shared/pipes/unmask-card-no.pipe";

// CR Shared Components
import { ShoppingCartComponent } from "../shared/components/shopping-cart/shopping-cart.component";
import { FiltersComponent } from "../shared/components/filters/filters.component";
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";

// Added code from `angular2-social-login` (had issues installing from npm)
import { Angular2SocialLoginModule } from "../../libs/social-login/angular2-social-login.module";

// CR Modules
import { CRMainDashboardModule } from '../cr-main-dashboard/cr-main-dashboard.module';

// CR Components
import { CRMainComponent } from '../cr-main/cr-main.component';
import { CRMainDashboardComponent } from '../cr-main-dashboard/cr-main-dashboard.component';
import { HomeComponent } from '../home/home.component';
import { SEOCuisineListComponent } from '../seo-cuisine-list/seo-cuisine-list.component';
import { SEODishListComponent } from '../seo-dish-list/seo-dish-list.component';
import { SEOMenuItemListComponent } from '../seo-menu-item-list/seo-menu-item-list.component';
import { SearchComponent } from '../search/search.component';
import { MenuComponent } from '../menu/menu.component';
import { LoginComponent } from '../login/login.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { RegisterComponent } from '../register/register.component';
import { MenuMapViewComponent } from '../menu-map-view/menu-map-view.component';
import { RestMapViewComponent } from '../rest-map-view/rest-map-view.component';
import { UserPaymentsComponent } from '../user-payments/user-payments.component';
import { UserAddressesComponent } from '../user-addresses/user-addresses.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { RestaurantDetailsComponent } from '../restaurant-details/restaurant-details.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { ReturnPolicyComponent } from '../return-policy/return-policy.component';
import { ProfileOrdersComponent } from "../profile-orders/profile-orders.component";
import { ProfileOrderDetailsComponent } from "../profile-order-details/profile-order-details.component";
import { ProfileSettingsComponent } from "../profile-settings/profile-settings.component";
import { AvailableCouponsModalComponent } from "../shared/components/available-coupons-modal/available-coupons-modal.component";
import { MyPointsComponent } from '../my-points/my-points.component';
import { ProfileOrderChatComponent } from '../profile-order-chat/profile-order-chat.component';
import { StartupService } from '../../shared/services/startup.service';
import { Util } from '../../shared/util';
import { LandingPageComponent } from '../landing-page/landing-page.component';

// import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
// import { GoogleLoginProvider, FacebookLoginProvider} from "angularx-social-login";


// let config = new AuthServiceConfig([
//   {
//     id: GoogleLoginProvider.PROVIDER_ID,
//     provider: new GoogleLoginProvider('661622537460-9gbqlhmmp9ufveq155pco873muns9scl.apps.googleusercontent.com')
//   },
//   {
//     id: FacebookLoginProvider.PROVIDER_ID,
//     provider: new FacebookLoginProvider('553011201718269')
//   }
// ]);

var routes = [
    {
        path: '', component: CRMainComponent, children: [
            { path: '', component: LandingPageComponent },
            // { path: 'restaurant/:cuisine/:name/:id', component: RestaurantDetailsComponent },

            {
                path: '', component: CRMainDashboardComponent, children: [
                    { path: 'search', component: SearchComponent },
                    { path: 'menu', component: MenuComponent },
                    { path: 'menu-map-view', component: MenuMapViewComponent },
                    { path: 'rest-map-view', component: RestMapViewComponent },
                    { path: 'checkout', component: CheckoutComponent },
                    { path: 'user-addresses', component: UserAddressesComponent },
                    { path: 'user-payments', component: UserPaymentsComponent },
                    { path: 'past-orders', component: ProfileOrdersComponent },
                    { path: 'past-orders/:id', component: ProfileOrderDetailsComponent },
                    { path: 'past-orders/chat/:id', component: ProfileOrderChatComponent },
                    { path: 'settings', component: ProfileSettingsComponent },
                    { path: 'my-points', component: MyPointsComponent },
                    { path: 'restaurant/:serviceType/:cuisine/:name/:id', component: RestaurantDetailsComponent },
                ]
            },
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: RegisterComponent },
            { path: 'verify-email/:id', component: VerifyEmailComponent },
            { path: 'reset-password', component: ResetPasswordComponent },
            { path: 'reset-password/:id', component: ResetPasswordComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            // { path: 'change-password', component: ChangePasswordComponent },

            { path: 'terms-of-use', component: TermsOfUseComponent },
            { path: 'about-us', component: AboutUsComponent },
            { path: 'privacy-policy', component: PrivacyPolicyComponent },
            { path: 'return-policy', component: ReturnPolicyComponent },
            { path: '404', component: PageNotFoundComponent },

            // Routes are very `Dynamic` should defined at last, so other routes get chance to `match` first
            { path: 'city/:city', component: SEOCuisineListComponent },

            { path: 'city/:city/:zipcode', component: SEOCuisineListComponent },

            { path: 'city/:city/:zipcode/:cuisine/page/:page', component: SEOCuisineListComponent },

            { path: 'city/:city/:zipcode/:cuisine/:dish/page/:page', component: SEOMenuItemListComponent },

            { path: 'city/:city/:zipcode/:cuisine/:dish/:dishType/page/:page', component: SEOMenuItemListComponent },

            { path: '**', redirectTo: '/404' },
        ]
    },
];

let CRMainModuleImports: any = [
    SharedModule,
    CommonModule,
    FormsModule,
    RouterModule,
    Ng2BreadcrumbModule.forRoot(),
    // TODO: make sure to put proper `ACL` on page routes
    RouterModule.forRoot(routes) //, { useHash: canUseHash }
];

if (typeof document !== 'undefined' && document) {
    // CRMainModuleImports.push(SocialLoginModule.initialize(config));
    console.log('social login init', window['APP_CONFIG']);

    var appConfig = window['APP_CONFIG'] || {};

    CRMainModuleImports.push(Angular2SocialLoginModule.initWithProviders({
        "google": {
            "clientId": appConfig['GOOGLE_PLUS_WEB_CLIENT_ID']
        },
        "facebook": {
            "clientId": appConfig['FB_CLIENT_ID'],
            "apiVersion": "v2.4" //like v2.4 
        }
    }));
}

@NgModule({
    imports: CRMainModuleImports,
    declarations: [
        ChangeAddressModalComponent,
        AvailableCouponsModalComponent,
        ShoppingCartComponent,
        FiltersComponent,
        SupportChatBoxComponent,
        UnMaskCardNoPipe,
    ],
    exports: [
        SharedModule,
        CommonModule,
        FormsModule,
        RouterModule,
        ChangeAddressModalComponent,
        AvailableCouponsModalComponent,
        ShoppingCartComponent,
        FiltersComponent,
        SupportChatBoxComponent,
        UnMaskCardNoPipe,
        Ng2BreadcrumbModule,
    ]
})
export class CRMainModule {
    LOG_TAG = 'CRMainModule';

    /**
     * constructor
     */
    constructor(private breadcrumbService: BreadcrumbService, private constants: Constants, private router: Router) {
        Util.log(this.LOG_TAG, 'constructor');

        // for (var i in constants.SERVICE_TYPE_TITLE) {
        //     var serviceType = constants.SERVICE_TYPE_TITLE[i];

        //     // e.g) /pick-up
        //     breadcrumbService.hideRoute(`/${serviceType}`);

        //     // e.g) /pick-up/los-angeles/90024
        //     breadcrumbService.hideRouteRegex(`^/pick-up/[A-Za-z0-9\-]+/[0-9]+$`);

        //     // e.g) /pick-up/los-angeles/90024/coffee-tea
        //     breadcrumbService.hideRouteRegex(`^/pick-up/[A-Za-z0-9\-]+/[0-9]+/[A-Za-z0-9\-]+$`);

        //     // e.g) /pick-up/los-angeles/90024/coffee-tea/page
        //     breadcrumbService.hideRouteRegex(`^/pick-up/[A-Za-z0-9\-]+/[0-9]+/[A-Za-z0-9\-]+/page$`);

        //     // e.g) /pick-up/los-angeles/90024/coffee-tea/cold-sandwiches/page
        //     breadcrumbService.hideRouteRegex(`^/pick-up/[A-Za-z0-9\-]+/[0-9]+/[A-Za-z0-9\-]+/page/[A-Za-z0-9\-]+$`);

        //     // e.g) /pick-up/los-angeles/90024/coffee-tea/page/1
        //     // breadcrumbService.hideRouteRegex(`^/pick-up/[A-Za-z0-9\-]+/[0-9]+/[A-Za-z0-9\-]+/page/[0-9]+$`);
        // }
    }
}