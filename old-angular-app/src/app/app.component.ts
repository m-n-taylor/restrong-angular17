import { Component, OnInit, ViewEncapsulation, PLATFORM_ID, Inject } from '@angular/core'
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TransferState } from '../modules/transfer-state/transfer-state';

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
import { ShoppingCart } from './shared/services/shopping-cart.service';

// CR Services
import { UserService } from './consumer/shared/services/user.service';

// RO Services
import { ROService } from './rest-owner/shared/services/ro.service';

// Shared Pipes
import { PhonePipe } from './shared/pipes/phone';
import { NameInitialsPipe } from './shared/pipes/name-initials';

@Component({
    selector: 'menus-app',
    template: `<div [ngClass]="{ 'no-obj-fit' : !isObjectFitSupported }"><router-outlet></router-outlet></div>`,
    encapsulation: ViewEncapsulation.None,
    styles: [require('./shared/styles/app.scss').toString()],
    providers: [InputService, HttpClient, AppService, ShoppingCart, EventsService, UserService, SharedDataService, PathService, DatePipe, CurrencyPipe, PhonePipe, NameInitialsPipe, DecimalPipe, ROService],
})
export class AppComponent implements OnInit {
    LOG_TAG = 'AppComponent =>';

    isObjectFitSupported = true;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private cache: TransferState, private router: Router) { }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');

        if (isPlatformBrowser(this.platformId)) {
            this.isObjectFitSupported = typeof document.documentElement.style['objectFit'] !== 'undefined';

            Util.log(this.LOG_TAG, 'isObjectFitSupported', this.isObjectFitSupported);
        }

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
