import { NgModule, ErrorHandler, ApplicationRef, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule, HashLocationStrategy, PathLocationStrategy, LocationStrategy, PlatformLocation } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule, ROUTER_CONFIGURATION } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Shared Components
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
import { TermsOfUseComponent } from './shared/components/terms-of-use/terms-of-use.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { VerifyEmailComponent } from './shared/components/verify-email/verify-email.component';

// RO Modules
import { ROMainModule } from './rest-owner/ro-main/ro-main.module';
import { ROMainDashboardModule } from './rest-owner/ro-main-dashboard/ro-main-dashboard.module';

// RO Components
import { ROMainComponent } from './rest-owner/ro-main/ro-main.component';
import { ROMainDashboardComponent } from './rest-owner/ro-main-dashboard/ro-main-dashboard.component';

// CR Modules
import { CRMainModule } from "./consumer/cr-main/cr-main.module";
import { CRMainDashboardModule } from "./consumer/cr-main-dashboard/cr-main-dashboard.module";

// CR Components
import { CRMainComponent } from "./consumer/cr-main/cr-main.component";
import { CRMainDashboardComponent } from "./consumer/cr-main-dashboard/cr-main-dashboard.component";

// Shared Services
import { PathService as Path } from './shared/services/path.service';
import { CanDeactivateGuard } from './shared/services/can-deactivate-guard.service';

// Shared Helpers
import { Util } from './shared/util';
import { Constants } from './shared/constants';

import { HttpTransferModule } from '@ngx-universal/state-transfer';
import { GlobalErrorHandler } from "./shared/services/global-error-handler.service";
import { StartupService } from './shared/services/startup.service';
import { RestrictOnMobileAppAuthGuard } from './shared/services/restrict-on-mobile-app-guard';
import { HttpClient } from './shared/services/http.client';
import { EventsService } from './shared/services/events.service';

export function startupServiceFactory(startupService: StartupService): Function {
    return () => startupService.load();
}

export function appBaseHref() {
    var baseHref = '/';
    
    if (typeof window !== 'undefined' && typeof window['APP_CONFIG'] !== 'undefined' && typeof window['APP_CONFIG'].APP_BASE_HREF !== 'undefined') {
        baseHref = window['APP_CONFIG'].APP_BASE_HREF;
    }

    return baseHref;
}

export function appLocationStrategy(platformLocationStrategy, baseHref) {
    var canUseHash = false;
    
    if (typeof window !== 'undefined' && typeof window['APP_CONFIG'] !== 'undefined' && window['APP_CONFIG'].LocationStrategy == 'Hash') {
        canUseHash = true;
    }

    return canUseHash ? new HashLocationStrategy(platformLocationStrategy, baseHref) :
        new PathLocationStrategy(platformLocationStrategy, baseHref);
}

@NgModule({
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        HttpModule,
        HttpTransferModule.forRoot(),
        ROMainModule,
        ROMainDashboardModule,
        CRMainModule,
        CRMainDashboardModule
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
        { provide: APP_BASE_HREF, useFactory: appBaseHref },
        Constants,
        HttpClient,
        EventsService,
        CanDeactivateGuard,
        RestrictOnMobileAppAuthGuard,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        },
        StartupService,
        {
            // Provider for APP_INITIALIZER
            provide: APP_INITIALIZER,
            useFactory: startupServiceFactory,
            deps: [StartupService],
            multi: true
        }, {
            provide: LocationStrategy,
            useFactory: appLocationStrategy,
            deps: [PlatformLocation, APP_BASE_HREF]
        }
    ]
})
export class AppModule {
    LOG_TAG = 'AppModule';

    constructor(private applicationRef: ApplicationRef, private constants: Constants) {
        Util.log(this.LOG_TAG, 'constructor');

        if (typeof window !== 'undefined' && window) {
            // console.log('clipboardJS', require('clipboard'));

            window['ClipboardJS'] = require('clipboard');

            window['APP_VERSION'] = this.constants.APP_VERSION;

            window['appRef'] = this.applicationRef;

            window['NodeVibrant'] = require('node-vibrant');

            // Quill Editor
            window['Quill'] = require('quill');

            // Color Picker 
            require('../../node_modules/c-p/color-picker.min');

            // Chart JS
            window['Chart'] = require('chart.js');

            // Flatpickr
            window['Flatpickr'] = require("flatpickr");

            // PDF make
            var pdfMake = require('pdfmake/build/pdfmake');
            var pdfFonts = require('pdfmake/build/vfs_fonts');
            pdfMake.vfs = pdfFonts.pdfMake.vfs;

            // Swiper
            window['Swiper'] = require('swiper');

            // Moment
            window['moment'] = require('moment');

            // Socket IO
            window['io'] = require('socket.io-client');
        }
    }
}