import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Util } from '../../../../shared/util';

// RO Models
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../../../shared/services/path.service';

// RO Services
import { ROService } from '../../services/ro.service';
import { ROMenuItem } from "../../models/ro-menu-item";

@Component({
	selector: 'menu-search-box',
	templateUrl: './menu-search-box.component.html',
	
})
export class MenuSearchBoxComponent {
	LOG_TAG = 'MenuSearchBoxComponent =>';

	@Input() clickAction: string;
	@Input() fireFlyID: string;

	autoCompleteList: Array<any> = [];
	searchText = '';

	isOpenACList = false;


	@Output() itemClicked: EventEmitter<any> = new EventEmitter<any>();

	constructor(public ROService: ROService, public router: Router) {
		Util.log(this.LOG_TAG, 'constructor');
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit');
	}

	openACList = (isOpen) => {
		setTimeout(() => {
			this.isOpenACList = isOpen;
		}, isOpen ? 0 : 200);
	}

	menusSearchTextEnter = () => {
		Util.log(this.LOG_TAG, 'menusSearchTextEnter()');

		this.openACList(true);

		this.loadMenusAutoComplete();
	}

	loadMenusAutoComplete = () => {
		Util.log(this.LOG_TAG, 'loadMenusAutoComplete()');

		var requestData = new ROAPIRequestData();

		requestData.ff = this.fireFlyID;
		requestData.search = this.searchText;

		this.ROService.getPreview(requestData).subscribe(response => {

			this.autoCompleteList = response.MasterHeading;

			Util.log(this.LOG_TAG, 'getPreview', response);
		});
	}

	viewMenuDetails = (masterHead) => {
		this.openACList(false);

		if (this.clickAction == 'event') {
			this.itemClicked.emit({
				type: 'masterHead',
				masterHead: masterHead,
			});
		}
		else {
			this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, masterHead.MasterHeadingID]);
		}
	}

	viewHeadDetails = (masterHead, head) => {
		this.openACList(false);

		if (this.clickAction == 'event') {
			this.itemClicked.emit({
				type: 'head',
				masterHead: masterHead,
				head: head,
			});
		}
		else {
			this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, masterHead.MasterHeadingID, Path.RO.CATEGORY_DETAILS, head.HeadingID]);
		}
	}

	viewMenuItemDetails = (masterHead, head, menuItem) => {
		this.openACList(false);

		menuItem = menuItem || <ROMenuItem>{};

		if (this.clickAction == 'event') {
			this.itemClicked.emit({
				type: 'menuItem',
				masterHead: masterHead,
				head: head,
				menuItem: menuItem,
			});
		}
		else {
			this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, masterHead.MasterHeadingID, Path.RO.CATEGORY_DETAILS, head.HeadingID, Path.RO.MENU_ITEM_DETAILS, menuItem.MenuItemID]);
		}
	}

}