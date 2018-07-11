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
// 
@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  providers: []
})
export class SearchBoxComponent {
  @Input() queryParams: QueryParams;
  @Output() filtersChanged: EventEmitter<any> = new EventEmitter<any>();

  searchText = '';
  autoSuggestList: any = {};
  showAutoSuggest = false;

  dishAutoSuggestList = [];
  cuisineAutoSuggestList = [];
  restAutoSuggestList = [];

  isBrowser: boolean;

  @ViewChild('changeAddressModal') public changeAddressModal: ChangeAddressModalComponent;

  constructor(public sharedDataService: SharedDataService, public constants: Constants, public appService: AppService) {
    this.isBrowser = isPlatformBrowser(sharedDataService.platformId);
  }

  searchTextChanged = () => {
    this.showAutoSuggest = true;

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
        var requestData = new SearchMenuAPIRequestData();

        SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

        this.appService.getKeywordsType(requestData).subscribe(response => {

          if (Util.isDefined(response.WordType) && Util.isDefined(response.WordType[0])) {
            var type = response.WordType[0].KeywordType;

            this.filtersChanged.emit({
              keywordType: type
            });
          }

          Util.log('getKeywordsType response', response);
        });
      }
      else {
        this.filtersChanged.emit({
          keywordType: keywordType
        });
      }
    }
    else {
      this.filtersChanged.emit({});
    }
  }

  searchTextEnter = () => {
    Util.log('searchTextEnter()', this.searchText);

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

    Util.log('autoSuggestItemClicked()', item);
  }

  addKeyword = (keyword, keywordType?) => {
    QueryParams.addKeyword(this.queryParams, keyword);
    // this.queryParams.keywords.push(keyword);

    this.emitFiltersChanged(keyword, keywordType);
  }

  removeKeyword = (keywordIndex) => {
    QueryParams.removeKeyword(this.queryParams, keywordIndex);
    //this.queryParams.keywords.splice(index, 1);

    this.emitFiltersChanged(this.queryParams.keywords.length > 0);
  }

  focusSearchText = (focus) => {
    this.showAutoSuggest = focus;

    Util.log('focusSearchText()', focus);
  }

  openChangeAddressModal = () => {
    this.changeAddressModal.open();
  }

}