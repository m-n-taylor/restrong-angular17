import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { MenuItem } from '../shared/models/menu-item';
import { QueryParams } from '../shared/models/query-params';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { SearchMenuAPIRequestData } from '../shared/models/search-menu-api-request-data';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'restaurant-details',
  templateUrl: './restaurant-details.component.html',
  providers: []
})
export class RestaurantDetailsComponent {
  routeSubscription: any;
  queryParams = new QueryParams();
  busy: boolean;

  selectedMasterHead: any = {};
  selectedMenuItem: any = {};
  currentRestaurant: MenuItem;

  masterHeads: any = [];

  searchText = '';

  @ViewChild('menuItemOptionsModal') public menuItemOptionsModal: any;

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router) {

    this.routeSubscription = this.route.queryParams
      .subscribe((params: any) => {

        this.queryParams.menuItemID = params.id;

        QueryParams.fillParams(this.queryParams, params);

        this.universalInit();

      });

    Util.log('search constructor()');
  }

  universalInit() {
    Util.log('search universalInit()', this.queryParams);

    this.loadData();
  }

  loadData = () => {
    this.busy = true;

    this.loadMasterHeads()
      .subscribe(response => {
        this.masterHeads = response;
        Util.log('masterHeads', this.masterHeads);

        var headsPromises = [];
        var menuItemsPromises = [];
        for (var i in this.masterHeads) {
          var masterHead = this.masterHeads[i];
          headsPromises.push(this.loadHeads(masterHead));
          menuItemsPromises.push(this.loadRestMenuItems(masterHead));
        }

        Observable.forkJoin(headsPromises)
          .subscribe(headsData => {

            Observable.forkJoin(menuItemsPromises)
              .subscribe(menuItemsData => {
                for (var i in this.masterHeads) {
                  var masterHead: any = this.masterHeads[i];
                  masterHead.heads = [];

                  for (var headIndex in headsData[i]) {
                    var head: any = headsData[i][headIndex];
                    head.menuItems = [];

                    if (head.Mhid == masterHead.Mhid) {
                      masterHead.heads.push(head);
                    }

                    for (var menuItemIndex in menuItemsData[i].Data) {
                      var menuItem: any = menuItemsData[i].Data[menuItemIndex];

                      if (menuItemIndex == '0') this.currentRestaurant = menuItem;

                      if (menuItem.HeadingID == head.Hid) {
                        head.menuItems.push(menuItem);
                      }

                    }
                  }
                }
                Util.log('menuItemsData', menuItemsData);

                if (this.masterHeads.length > 0) {
                  this.chooseMasterHead(this.masterHeads[0]);
                }

                this.busy = false;
              });

            Util.log('heads', headsData);
          });

      });
    //this.loadMenuItem();
  }

  loadMasterHeads = () => {
    var requestData = new SearchMenuAPIRequestData();
    requestData.restaurantid = this.queryParams.restaurantID;

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    return this.appService.searchHeadings(requestData);
  }

  loadHeads = (masterHead) => {
    var requestData = new SearchMenuAPIRequestData();

    requestData.restaurantid = this.queryParams.restaurantID;
    requestData.mhid = masterHead.Mhid;

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    return this.appService.searchHeadings(requestData);
  }

  loadRestMenuItems = (masterHead) => {
    Util.log('loadRestMenuItems()');

    var requestData = new SearchMenuAPIRequestData();
    requestData.restaurantid = this.queryParams.restaurantID;
    requestData.mhid = masterHead.Mhid;
    //requestData.page = 1;
    //requestData.pageSize = 20;

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    return this.appService.searchMenuItems(requestData);
  }

  chooseMasterHead = (masterHead) => {
    this.selectedMasterHead = masterHead;

    this.searchTextChanged();

    Util.log('selectedMasterHead', this.selectedMasterHead);
  }

  chooseMenuItem = (menuItem) => {
    this.selectedMenuItem = menuItem;

    this.menuItemOptionsModal.open(this.selectedMenuItem);
  }

  searchTextChanged = () => {
    if (!Util.isDefined(this.searchText) || this.searchText == '') {
      this.selectedMasterHead.filteredHeads = this.selectedMasterHead.heads;
    }
    else {
      this.selectedMasterHead.filteredHeads = [];

      for (var i in this.selectedMasterHead.heads) {
        var head = this.selectedMasterHead.heads[i];
        var newHead: any = {};

        newHead.Heading = head.Heading;
        newHead.menuItems = [];

        for (var j in head.menuItems) {
          var item: MenuItem = head.menuItems[j];

          if (item.MenuItemName.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1) {
            newHead.menuItems.push(item);
          }
        }

        this.selectedMasterHead.filteredHeads.push(newHead);
      }
    }

    Util.log('searchTextChanged', this.searchText);

  }

  menuItemOptionsModalEvents = (event) => {

    Util.log('event data', event);
  }
}
