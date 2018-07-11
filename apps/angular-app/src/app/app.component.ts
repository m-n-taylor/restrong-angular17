import { Component, OnInit, PLATFORM_ID, Inject, ViewContainerRef, Renderer2, ViewChild } from '@angular/core'
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from './shared/util';
import { Constants } from './shared/constants';

// Shared Services
import { PathService } from './shared/services/path.service';
import { InputService } from './shared/services/input.service';
import { HttpClient } from './shared/services/http.client';
import { AppService } from './shared/services/app.service';
import { EventsService } from './shared/services/events.service';
import { BaseModal } from './shared/services/base-modal.service';
import { SharedDataService } from './shared/services/shared-data.service';

// CR Services
import { UserService } from './consumer/shared/services/user.service';

// RO Services
import { ROService } from './rest-owner/shared/services/ro.service';

// Shared Pipes
import { PhonePipe } from './shared/pipes/phone';
import { NameInitialsPipe } from './shared/pipes/name-initials';
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { ColorService } from "./shared/services/color.service";
import { FiltersService } from "./consumer/shared/services/filters.service";
import { HelperService } from "./shared/services/helper.service";
import { StartupService } from './shared/services/startup.service';

@Component({
    selector: 'menus-app',
    template: `<div #mainApp><router-outlet></router-outlet></div>`,
    providers: [
        HelperService,
        InputService,
        HttpClient,
        AppService,
        EventsService,
        UserService,
        SharedDataService,
        PathService,
        DatePipe,
        CurrencyPipe,
        PhonePipe,
        NameInitialsPipe,
        DecimalPipe,
        ROService,
        ColorService
    ]
})
export class AppComponent implements OnInit {
    LOG_TAG = 'AppComponent =>';

    isObjectFitSupported = true;

    @ViewChild('mainApp') mainApp: any;
    constructor(private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private toastr: ToastsManager, vcr: ViewContainerRef, private startupService: StartupService, private constants: Constants) {
        this.toastr.setRootViewContainerRef(vcr);

        Util.log(this.LOG_TAG, 'constructor', this.startupService.config);
    }

    ngOnInit() {
        // TODO: make sure to apply platform settings stylesheet and settings in SSR
        // if (typeof window !== 'undefined') {
        //     window['mainApp'] = this.mainApp;
        //     window['renderer'] = this.renderer;
        // }

        // this.renderer.listen('body', 'onload', (event) => {
        //     Util.log(this.LOG_TAG, 'Body loaded...', event);
        // });

        Util.log(this.LOG_TAG, 'Init()');

        // clears the cache
        // this.cache.set('cached', true);

        // TODO: Remeber Scroll Position Issue (Browser remeber position on back,forward) but need to do `window.scrollTo(0, 0)` when user open new route
        // this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
        //   Util.log(this.LOG_TAG, 'Route Changed', event);

        //   if (typeof window !== 'undefined' && window) window.scroll(0, 0);
        // });

        // this.router.events.subscribe((evt) => {
        //   Util.log(this.LOG_TAG, 'Route Changed', evt);

        //   // if (!(evt instanceof NavigationEnd)) {
        //   //   return;
        //   // }

        //   // // Util.log(this.LOG_TAG, 'Route Changed', evt);

        //   // if (typeof window !== 'undefined' && window) window.scrollTo(0, 0);

        // });
    }

}
