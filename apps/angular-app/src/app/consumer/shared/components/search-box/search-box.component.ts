import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// Shared Models
import { QueryParams } from '../../../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../../../shared/services/app.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';

// CR Shared Components
import { ChangeAddressModalComponent } from "../../components/change-address-modal/change-address-modal.component";
import { EventsService } from "../../../../shared/services/events.service";
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ShoppingCart } from '../../services/shopping-cart.service';
// 
@Component({
	selector: 'search-box',
	templateUrl: './search-box.component.html',

})
export class SearchBoxComponent {
	LOG_TAG = 'SearchBoxComponent';

	searchText = '';
	autoSuggestList: any = {};
	showAutoSuggest = false;
	busyAutoSuggest = false;

	dishAutoSuggestList = [];
	cuisineAutoSuggestList = [];
	restAutoSuggestList = [];

	isBrowser: boolean;

	@Input() queryParams: QueryParams;

	@ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;
	@ViewChild('changeAddressModal') public changeAddressModal: ChangeAddressModalComponent;

	constructor(public sharedDataService: SharedDataService, public constants: Constants, public appService: AppService, public eventsService: EventsService, private shoppingCart: ShoppingCart) {
		this.isBrowser = isPlatformBrowser(sharedDataService.platformId);
	}

	searchTextChanged = () => {
		this.focusSearchText(true);

		this.autoSuggestList = this.sharedDataService.autoSuggestList || {};

		// Dishes
		var dishList = this.autoSuggestList.Dish || [];

		this.dishAutoSuggestList = dishList.filter((item) => {
			return item.Name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
		});

		this.dishAutoSuggestList = this.dishAutoSuggestList.slice(0, 3);

		// Cuisines
		var cuisineList = this.autoSuggestList.Cuisine || [];

		this.cuisineAutoSuggestList = cuisineList.filter((item) => {
			return item.Name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
		});

		this.cuisineAutoSuggestList = this.cuisineAutoSuggestList.slice(0, 3);

		// Restaurants
		var restList = this.autoSuggestList.Restaurant || [];

		this.restAutoSuggestList = restList.filter((item) => {
			return item.Name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
		});

		this.restAutoSuggestList = this.restAutoSuggestList.slice(0, 3);
	}

	emitFiltersChanged = (keyword?, keywordType?) => {
		if (keyword) {
			// If keyword type is unknown
			if (!keywordType) {
				this.busyAutoSuggest = true;

				var requestData = new SearchMenuAPIRequestData();

				SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

				this.appService.getKeywordsType(requestData).subscribe(response => {

					if (Util.isDefined(response.WordType) && Util.isDefined(response.WordType[0])) {
						var type = response.WordType[0].KeywordType;

						this.eventsService.onFiltersChanged.emit({
							filtersType: [this.constants.FILTER_KEYWORDS],
							keywordType: type
						});
					}

					this.busyAutoSuggest = false;

					Util.log(this.LOG_TAG, 'getKeywordsType response', response);
				});
			}
			else {
				this.eventsService.onFiltersChanged.emit({
					filtersType: [this.constants.FILTER_KEYWORDS],
					keywordType: keywordType
				});
			}
		}
		else {
			this.eventsService.onFiltersChanged.emit({
				filtersType: [this.constants.FILTER_KEYWORDS]
			});
		}
	}

	searchTextEnter = () => {
		Util.log(this.LOG_TAG, 'searchTextEnter()', this.searchText);

		this.focusSearchText(false);

		if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
			this.addKeyword(this.searchText);

			this.searchText = '';
		}
		else {
			this.emitFiltersChanged();
		}
	}

	autoSuggestItemClicked = (item, keywordType) => {
		this.addKeyword(item.Name, keywordType);

		this.searchText = '';

		Util.log(this.LOG_TAG, 'autoSuggestItemClicked()', item);
	}

	addKeyword = (keyword, keywordType?) => {
		QueryParams.addKeyword(this.queryParams, keyword);
		// this.queryParams.keywords.push(keyword);

		this.emitFiltersChanged(keyword, keywordType);
	}

	removeKeyword = (keywordIndex) => {
		QueryParams.removeKeyword(this.queryParams, keywordIndex);
		//this.queryParams.keywords.splice(index, 1);

		this.emitFiltersChanged(this.queryParams.keywords && this.queryParams.keywords.length > 0);
	}

	focusSearchText = (focus) => {
		this.showAutoSuggest = focus;

		Util.log(this.LOG_TAG, 'focusSearchText()', focus);
	}

	openChangeAddressModal = () => {
		if (this.shoppingCart.cartItems.length > 0) {
			this.confirmModal.open({ message: this.constants.MSG_WARN_CHANGE_ADDRESS, okText: 'Continue', cancelText: 'Cancel' })
				.then((confirm) => {
					if (confirm) {
						this._openChangeAddressModal();
					}
				});
		}
		else {
			this._openChangeAddressModal();
		}
	}

	private _openChangeAddressModal = () => {
		var userAddress = this.sharedDataService.hasUserAddress() ? this.sharedDataService.userAddress : null;

		this.changeAddressModal.open({ userAddress: userAddress }).then((data) => {

			// If data is passed
			if (Util.isDefined(data)) {

				// if user address is passed
				if (Util.isDefined(data.userAddress)) {
					this.sharedDataService.userAddress = data.userAddress;

					// this.emitFiltersChanged(true);
				}

			}
			else {
				// user cancelled
			}

			Util.log(this.LOG_TAG, 'openChangeAddressModal', data);
		});
	}

}