import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';

@Component({
	selector: 'ro-restaurant-preview',
	templateUrl: './restaurant-preview.component.html'
})
export class RestaurantPreviewComponent implements OnInit {
	LOG_TAG = 'RestaurantPreviewComponent => ';

	busy = false;

	otherFireFlyID: string;
	otherFireFlyData: any;
	fireFlyID: string;

	rest: Restaurant;

	public get isAllLoaded(): boolean {
		return !this.busy && Util.isDefined(this.rest) && Util.isDefined(this.otherFireFlyData);
	}

	constructor(public constants: Constants, private ROService: ROService, private router: Router, private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService, private ngZone: NgZone) { }

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		this.activatedRoute.params.subscribe((params: any) => {
			Util.log(this.LOG_TAG, 'params', params);

			this.otherFireFlyID = params.id;
			this.fireFlyID = params.fireFlyID;

			this.loadData();
		});
	}

	loadRestInfo = (fireFlyID) => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, fireFlyID);

		return this.ROService.getRestInfo(requestData);
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		this.loadRestInfo(this.fireFlyID).subscribe((response: any) => {
			var restInfoResponse: any = response;
			this.rest = restInfoResponse.Data;

			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.rest.Name);

			this.ngZone.run(() => {
				this.busy = false;
			});

			Util.log(this.LOG_TAG, 'forkJoin', response, this.busy);
		});
	}

	otherFireFlyDataChange = (data) => {
		this.otherFireFlyData = data;

		this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.PREVIEW}/${this.otherFireFlyID}`, this.otherFireFlyData.RestName);

		Util.log(this.LOG_TAG, 'otherFireFlyDataChange', data);
	}

	goBack = () => {
		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID], { queryParams: { tab: 'charts' } });

		Util.log(this.LOG_TAG, 'goBack');
	}
}