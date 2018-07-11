import { Component, OnInit, ViewChild, NgZone, trigger, state, style, transition, animate } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { UserService } from '../shared/services/user.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// RO Components
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Constants } from '../../shared/constants';

@Component({
    selector: 'menus-app',
    templateUrl: './ro-main-dashboard.component.html',
    animations: [
        // Define an animation that adjusts the opactiy when a new item is created
        //  in the DOM. We use the 'visible' string as the hard-coded value in the 
        //  trigger.
        //
        // When an item is added we wait for 300ms, and then increase the opacity to 1
        //  over a 200ms time interval. When the item is removed we don't delay anything
        //  and use a 200ms interval.
        //
        trigger('visibleTrigger', [
            state('visible', style({ opacity: '1' })),
            transition('void => *', [style({ opacity: '0' }), animate('00ms 300ms')]),
            transition('* => void', [animate('200ms', style({ opacity: '0' }))])
        ])
    ]
})
export class ROMainDashboardComponent implements OnInit {
    LOG_TAG = 'ROMainDashboardComponent =>';

    selectedRestTab = null;
    subscriptionRestTabSelected = null;

    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

    constructor(public userService: UserService, public sharedDataService: SharedDataService, private eventsService: EventsService, private zone: NgZone, public router: Router, public constants: Constants) {

        this.subscriptionRestTabSelected = this.eventsService.onRestTabSelected.subscribe((data) => {
            this.selectedRestTab = data.tab;

            Util.log(this.LOG_TAG, 'onRestTabSelected', data);
        });

    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');
    }

    selectTab = (tab) => {
        Util.log(this.LOG_TAG, 'selectTab', tab);

        this.eventsService.requestSelectRestTab.emit({
            tab: tab
        });
    }

    logout = () => {
        Util.log(this.LOG_TAG, 'logout()');

        this.confirmModal.open({ message: `Are you sure you want to logout?` })
            .then((confirm) => {

                if (confirm) {
                    this.userService.loginUser = null;

                    this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
                }

            });
    }

    ngOnDestroy() {

        if (this.subscriptionRestTabSelected) {
            this.subscriptionRestTabSelected.unsubscribe();
        }

    }
}