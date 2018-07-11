import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Shared Components
import { MapCustomerRouteModalComponent } from '../shared/components/map-customer-route-modal/map-customer-route-modal.component';

// RO Models
import { MasterHead } from '../shared/models/master-head';
import { Head } from '../shared/models/head';
import { MenuItem } from '../shared/models/menu-item';
import { Restaurant } from '../shared/models/restaurant';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';
import { HelperService } from '../shared/services/helper.service';

// Shared Pipes
import { PhonePipe } from '../../shared/pipes/phone';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
	selector: 'ro-edit-order',
	templateUrl: './edit-order.component.html'
})
export class EditOrderComponent implements OnInit {
	LOG_TAG = 'EditOrderComponent => ';

	busy = false;
	busyMenuItems = false;

	orderID: string;
	fireFlyID: string;

	restInfo = new Restaurant();

	order = {
		OrderDetail: <any>{},
		CustomerInfo: <any>{},
		MenuDetail: <any>[],
	};

	masterHeads = new Array<MasterHead>();
	selectedMasterHead = new MasterHead();

	heads = new Array<Head>();
	selectedHead = new Head();

	menuItems = new Array<MenuItem>();

	selectedMenuItem: MenuItem;

	@ViewChild('mapCustomerRouteModal') public mapCustomerRouteModal: MapCustomerRouteModalComponent;

	constructor(public constants: Constants, private ROService: ROService, private router: Router, private location: Location, private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService, private toastr: ToastsManager, private currencyPipe: CurrencyPipe, private phonePipe: PhonePipe, private datePipe: DatePipe, private sharedDataService: SharedDataService, private helperService: HelperService) { }

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		this.activatedRoute.params.subscribe((params: any) => {
			Util.log(this.LOG_TAG, 'params', params);

			this.orderID = params.id;
			this.fireFlyID = params.fireFlyID;

			this.loadData();
		});
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		var restInfoPromise = this.loadRestInfo();
		var orderDetailsPromise = this.loadOrderDetails();
		var masterHeadsPromise = this.loadMasterHeads();

		Observable.forkJoin([restInfoPromise, orderDetailsPromise, masterHeadsPromise]).subscribe((response: any) => {
			var restInfoResponse: any = response[0];
			this.restInfo = restInfoResponse.Data;

			var orderDetailsResponse: any = response[1];
			this.order = orderDetailsResponse;

			var masterHeadsResponse: any = response[2];
			this.masterHeads = masterHeadsResponse.Data;

			if (this.masterHeads.length > 0) {
				this.chooseMasterHead(this.masterHeads[0]);
			}

			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfo.Name);
			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.ORDER_DETAILS}/${this.orderID}`, this.order.OrderDetail.OrderNumber);

			this.busy = false;

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	loadRestInfo = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

		return this.ROService.getRestInfo(requestData);
	}

	loadOrderDetails = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillOrderID(requestData, this.orderID);

		return this.ROService.getOrderInfo(requestData);
	}

	loadMasterHeads = () => {
		Util.log(this.LOG_TAG, 'loadMasterHeads()');

		this.busy = true;

		var requestData = new ROAPIRequestData();

		requestData.ff = this.fireFlyID;

		return this.ROService.getMasterHeadList(requestData);
	}

	chooseMasterHead = (masterHead) => {
		Util.log(this.LOG_TAG, 'chooseMasterHead()');

		this.selectedMasterHead = masterHead;

		var headPromise = this.loadHeadList(this.selectedMasterHead.ID);

		headPromise.subscribe((response: any) => {
			this.heads = response.Data;

			if (this.heads.length > 0) {
				this.chooseHead(this.heads[0]);
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	loadHeadList = (masterHeadID) => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillMasterHeadID(requestData, masterHeadID);

		return this.ROService.getHeadList(requestData);
	}

	chooseHead = (head) => {
		Util.log(this.LOG_TAG, 'chooseHead()');

		this.selectedHead = head;

		var menuItemsPromise = this.loadMenuItemList(this.selectedHead.ID);

		menuItemsPromise.subscribe((response: any) => {
			this.menuItems = response.Data;

			this.busyMenuItems = false;

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	loadMenuItemList = (headID) => {
		this.busyMenuItems = true;
		this.menuItems = [];

		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillHeadID(requestData, headID);

		return this.ROService.getMenuItemList(requestData);
	}

	chooseMenuItem = (menuItem) => {
		this.selectedMenuItem = null;

		setTimeout(() => {
			this.selectedMenuItem = menuItem;
		}, 500);
	}

	goBack = () => {
		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID]);

		Util.log(this.LOG_TAG, 'goBack');
	}
}
