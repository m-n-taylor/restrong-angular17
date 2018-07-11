import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// RO Services
import { ROService } from '../../../rest-owner/shared/services/ro.service';

@Component({
	selector: 'page-not-found',
	templateUrl: './page-not-found.component.html'
})
export class PageNotFoundComponent implements OnInit {
	LOG_TAG = 'PageNotFoundComponent';

	busy = false;

	constructor(private router: Router) {
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');
	}

	goHome = () => {
		Util.log(this.LOG_TAG, 'goHome()');

		this.router.navigate(['/']);
	}

}