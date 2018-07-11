import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
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
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

@Component({
    selector: 'menus-app',
    templateUrl: './ro-main-dashboard.component.html',
})
export class ROMainDashboardComponent implements OnInit {
    LOG_TAG = 'ROMainDashboardComponent =>';

    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

    constructor(public userService: UserService, public sharedDataService: SharedDataService, private eventsService: EventsService, private zone: NgZone, private router: Router) {

    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');
    }

    logout = () => {
        Util.log(this.LOG_TAG, 'logout()');

        this.confirmModal.open({ message: `Are you sure you want to logout?` })
            .then((confirm) => {

                if (confirm) {
                    this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
                }

            });
    }
}