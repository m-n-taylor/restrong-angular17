import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Models
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
	selector: 'ro-manage-restaurant',
	templateUrl: './manage-restaurant.component.html'
})
export class ManageRestaurantComponent implements OnInit {
	LOG_TAG = 'ManageRestaurantComponent =>';
	PAGINATION_ID = 'MANAGE_REST_PAGINATION_ID';

	busy: boolean;

	page: number;
	pageSize: number;
	totalPages: number;
	totalRows: number;

	restList: Array<any>;

	searchText: string;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, private ROService: ROService, private sharedDataService: SharedDataService, private router: Router, private route: ActivatedRoute) {
		this.busy = false;

		this.totalPages = 0;
		this.totalRows = 0;

		this.restList = [];
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		if (isPlatformBrowser(this.platformId)) {
			this.initPage();
		}
	}

	initPage = () => {
		Util.log(this.LOG_TAG, 'initPage()');

		this.route.queryParams.subscribe(queryParams => {

			this.page = Util.isDefined(queryParams.page) ? queryParams.page : 1;
			this.pageSize = Util.isDefined(queryParams.pageSize) ? queryParams.pageSize : 25;
			this.searchText = Util.isDefined(queryParams.search) ? queryParams.search : '';

			this.loadData();

			Util.log(this.LOG_TAG, 'queryParams', queryParams);
		});
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillPage(requestData, this.page);
		ROAPIRequestData.fillPageSize(requestData, this.pageSize);

		if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
			ROAPIRequestData.fillSearch(requestData, this.searchText);
		}

		this.ROService.getRestList(requestData).subscribe(response => {
			this.restList = response.Data;

			this.totalPages = response.Pagination.TotalPages;
			this.totalRows = response.Pagination.TotalRow;

			this.busy = false;

			Util.log(this.LOG_TAG, 'getRestList', response);
		});
	}

	searchTextEnter = () => {
		// Reset the `page no`
		this.page = 1;

		this.pageChange();
	}

	pageChange = () => {
		var queryParams: any = {};

		queryParams.page = this.page;
		queryParams.pageSize = this.pageSize;

		if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
			queryParams.search = this.searchText;
		}

		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`], { queryParams: queryParams });

		Util.log(this.LOG_TAG, 'pageChange', queryParams);
	}

	viewRestaurant = (rest) => {
		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, rest.FireFlyID]);
	}
}