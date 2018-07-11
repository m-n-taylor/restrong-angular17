import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Services
import { UserService } from '../shared/services/user.service';
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
	selector: 'ro-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
	LOG_TAG = 'HomeComponent';

	busy = false;

	isBrowser: boolean;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, private ROService: ROService, public userService: UserService, public constants: Constants, private router: Router, private toastr: ToastsManager, public sharedDataService: SharedDataService) {
		this.isBrowser = isPlatformBrowser(this.platformId);

		if (this.isBrowser) {

		}
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');
	}
}
