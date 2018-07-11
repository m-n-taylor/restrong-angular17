import { Component, OnInit, Inject, PLATFORM_ID, ViewContainerRef } from '@angular/core'
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';

// RO Services
import { UserService } from '../shared/services/user.service';
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';
import { HelperService } from '../shared/services/helper.service';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { PathService as Path } from '../../shared/services/path.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'ro-main',
    template: `<div class='ro-app'><router-outlet></router-outlet></div>`,
    providers: [ROService, SharedDataService, HelperService]
})
export class ROMainComponent implements OnInit {
    LOG_TAG = 'ROMainComponent =>';

    subscriptionAuthCodeExpiration = null;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private sharedDataService: SharedDataService, private ROService: ROService, private toastr: ToastsManager, vcr: ViewContainerRef, private eventsService: EventsService, private router: Router) {
        Util.log(this.LOG_TAG, 'constructor()');
        
        this.toastr.setRootViewContainerRef(vcr);

        this.ROService.getGlobalSettings().promise.subscribe((response: any) => {
            if (isPlatformBrowser(this.platformId)) {
                this.sharedDataService.globalSettings = response;
                Util.log(this.LOG_TAG, 'getGlobalSettings()', response);
            }
        });
    }

    ngOnInit() {
        this.subscriptionAuthCodeExpiration = this.eventsService.onAuthCodeExpired.subscribe((data) => {
            if (data.type == 'RO') {
                this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`], { queryParams: { session: 'expired' } });
            }

            Util.log(this.LOG_TAG, 'onAuthCodeExpired', data);
        });

        Util.log(this.LOG_TAG, 'Init()');
    }

    ngOnDestroy() {
        Util.log(this.LOG_TAG, 'ngOnDestroy');

        if (this.subscriptionAuthCodeExpiration) {
            this.subscriptionAuthCodeExpiration.unsubscribe();
        }
    }
}