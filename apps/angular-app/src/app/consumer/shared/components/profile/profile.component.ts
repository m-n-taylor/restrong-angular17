import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Constants } from "../../../../shared/constants";
import { Util } from "../../../../shared/util";

import { UserService } from "../../services/user.service";
import { AppService } from "../../../../shared/services/app.service";

@Component({
	selector: 'profile',
	templateUrl: './profile.component.html',

})
export class ProfileComponent {
	LOG_TAG = 'ProfileComponent';

	busy: boolean;
	pastOrders: Array<any>;

	@Input() activeTab: string;

	constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public userService: UserService) {
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');
	}
}