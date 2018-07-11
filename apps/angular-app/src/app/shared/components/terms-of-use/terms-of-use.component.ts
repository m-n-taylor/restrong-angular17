import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// RO Services
import { ROService } from '../../../rest-owner/shared/services/ro.service';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
	selector: 'terms-of-use',
	templateUrl: './terms-of-use.component.html'
})
export class TermsOfUseComponent implements OnInit {
	LOG_TAG = 'TermsOfUseComponent';

	busy = false;

	userTerms = '';

	constructor(public sharedDataService: SharedDataService) { }

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');
	}
}