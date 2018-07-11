import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Services
import { AppService } from "../../shared/services/app.service";
import { APIRequestData } from "../../shared/models/api-request-data";
import { SharedDataService } from '../../shared/services/shared-data.service';

@Component({
	selector: 'about-us',
	templateUrl: './about-us.component.html'
})
export class AboutUsComponent implements OnInit {
	LOG_TAG = 'AboutUsComponent';

	busy = false;

	text = '';

	constructor(public sharedDataService: SharedDataService) {
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');
	}
}