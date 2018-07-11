import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { SharedModule } from '../../shared.module';

import { Constants } from '../../shared/constants';

// Shared Components
import { ShoppingCartModalComponent } from "../../shared/components/shopping-cart-modal/shopping-cart-modal.component";
import { Ng2BreadcrumbModule, BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// Shared Pipes
import { UnMaskCardNoPipe } from "../../shared/pipes/unmask-card-no.pipe";

// CR Shared Components
import { ShoppingCartComponent } from "../shared/components/shopping-cart/shopping-cart.component";
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";

// Added code from `angular2-social-login` (had issues installing from npm)
import { Angular2SocialLoginModule } from "../../shared/components/social-login/angular2-social-login.module";

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

let CRMainModuleImports: any = [
    SharedModule,
    InfiniteScrollModule,
    CommonModule,
    FormsModule,
    RouterModule,
    Ng2BreadcrumbModule.forRoot(),
];

if (typeof document !== 'undefined' && document) {
    CRMainModuleImports.push(Angular2SocialLoginModule.initWithProviders(providers));
}

@NgModule({
    imports: CRMainModuleImports,
    declarations: [
        ShoppingCartModalComponent,
        ChangeAddressModalComponent,
        ShoppingCartComponent,
        UnMaskCardNoPipe,
    ],
    exports: [
        SharedModule,
        CommonModule, 
        FormsModule, 
        RouterModule, 
        InfiniteScrollModule, 
        ShoppingCartModalComponent, 
        ChangeAddressModalComponent, 
        ShoppingCartComponent, 
        UnMaskCardNoPipe,
        Ng2BreadcrumbModule,
    ]
})
export class CRMainModule {
    /**
     * constructor
     */
    constructor(private breadcrumbService: BreadcrumbService, private constants: Constants) {
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