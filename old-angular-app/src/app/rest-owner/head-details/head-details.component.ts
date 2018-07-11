import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { Head } from '../shared/models/head';
import { MenuItem } from '../shared/models/menu-item';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';
import { MenuItemAPIRequestData } from '../shared/models/menu-item-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { HelperService } from '../shared/services/helper.service';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'ro-head-details',
  templateUrl: './head-details.component.html'
})
export class HeadDetailsComponent implements OnInit {
  LOG_TAG = 'HeadDetailsComponent => ';

  busy = false;
  isBrowser = false;

  masterHeadID: number;
  headID: number;
  fireFlyID: string;

  restInfo = new Restaurant();
  masterHead: any = {};
  head: any = {};
  menuItemList = new Array<MenuItem>();

  @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private router: Router, private location: Location, private activatedRoute: ActivatedRoute, private helperService: HelperService, private breadcrumbService: BreadcrumbService, private toastr: ToastsManager) {
  }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'Init()');

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (isPlatformBrowser(this.platformId)) {
      this.initPage();
    }
  }

  initPage = () => {
    this.activatedRoute.params.subscribe((params: any) => {
      Util.log(this.LOG_TAG, 'params', params);

      this.masterHeadID = params.masterHeadID;
      this.headID = params.id;
      this.fireFlyID = params.fireFlyID;

      this.loadData();
    });
  }

  loadData = () => {
    Util.log(this.LOG_TAG, 'loadData()');

    this.busy = true;

    var restInfoPromise = this.loadRestInfo();
    var masterHeadInfoPromise = this.loadMasterHeadInfo();
    var headInfoPromise = this.loadHeadInfo();
    var menuItemListPromise = this.loadMenuItemList();

    Observable.forkJoin([restInfoPromise, masterHeadInfoPromise, headInfoPromise, menuItemListPromise]).subscribe(response => {
      var restInfoResponse: any = response[0];
      this.restInfo = restInfoResponse.Data;

      var masterHeadInfoResponse: any = response[1];
      this.masterHead = masterHeadInfoResponse.Data;

      var headInfoResponse: any = response[2];
      this.head = headInfoResponse.Data;

      var menuItemListResponse: any = response[3];
      this.menuItemList = menuItemListResponse.Data;

      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfo.Name);
      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.MENU_DETAILS}/${this.masterHeadID}`, this.masterHead.Name)
      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.MENU_DETAILS}/${this.masterHeadID}/${Path.RO.CATEGORY_DETAILS}/${this.headID}`, this.head.Name)

      this.busy = false;

      Util.log(this.LOG_TAG, 'loadData => forkJoin', response);
    });
  }

  onMenuItemDragSuccess = (event) => {
    Util.log(this.LOG_TAG, 'onHeadDragSuccess', event, this.menuItemList);

    this.helperService.calculateSortID(this.menuItemList);

    this.saveMenuItemsSortOrder();
  }

  saveMenuItemsSortOrder = () => {
    this.busy = true;

    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

    var body = {
      SortDetails: []
    };

    for (var index in this.menuItemList) {
      var menuItem = this.menuItemList[index];

      body.SortDetails.push({
        ID: menuItem.ID,
        SortID: menuItem.SortID,
      });
    }

    this.ROService.updateMenuItemSortOrder(requestData, body).subscribe(response => {
      this.busy = false;

      Util.log(this.LOG_TAG, 'updateMenuItemSortOrder', response);
    });
  }

  loadRestInfo = () => {
    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

    return this.ROService.getRestInfo(requestData);
  }

  loadMasterHeadInfo = () => {
    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    ROAPIRequestData.fillID(requestData, this.masterHeadID);

    return this.ROService.getMasterHeadInfo(requestData);
  }

  loadHeadInfo = () => {
    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    ROAPIRequestData.fillID(requestData, this.headID);

    return this.ROService.getHeadInfo(requestData);
  }

  loadMenuItemList = () => {
    var requestData = new ROAPIRequestData();

    requestData.ff = this.fireFlyID;
    requestData.hid = this.headID;

    return this.ROService.getMenuItemList(requestData);
  }

  viewMenuItemDetails = (menuItem?: MenuItem) => {
    menuItem = menuItem || new MenuItem();

    this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, this.masterHeadID, Path.RO.CATEGORY_DETAILS, this.headID, Path.RO.MENU_ITEM_DETAILS, menuItem.ID || 0]);
  }

  // openSaveMenuItemModal = (menuItem?: MenuItem) => {
  //   this.saveMenuItemModal.open({
  //     fireFlyID: this.fireFlyID,
  //     headID: this.headID,
  //     menuItem: menuItem
  //   });
  // }

  // saveMenuItemModalEvents = (event) => {
  //   if (event.action == SaveMenuItemModalComponent.EVENT_ADD_ITEM) {
  //     var menuItem: MenuItem = event.data;

  //     this.menuItemList.push(menuItem);
  //   }
  //   else if (event.action == SaveMenuItemModalComponent.EVENT_MODAL_CLOSE) {
  //   }

  //   Util.log(this.LOG_TAG, 'saveMenuItemModalEvents', event);
  // }

  toggleActiveHead = (head: Head) => {
    Util.log(this.LOG_TAG, 'toggleActiveHead', head);

    this._saveHead(head);
  }

  private _saveHead = (head: Head) => {
    Util.log(this.LOG_TAG, '_saveHead()');

    this.busy = true;

    var data = {
      fireFlyID: this.fireFlyID,
      masterHeadID: this.masterHeadID,
      head: head
    };

    this.ROService.saveHead(data).subscribe((response: any) => {

      this.busy = false;

      if (response.Status == this.constants.STATUS_SUCCESS) {
        this.toastr.success(`${head.Name} updated successfully.`, 'Success!');
      }
      else {
        this.toastr.error('Unable to update item, Please try later.', 'Error!');
      }

      Util.log(this.LOG_TAG, 'saveHead', response);
    });
  }

  toggleActiveMenuItem = (menuItem: MenuItem) => {
    Util.log(this.LOG_TAG, 'toggleActiveMenuItem', menuItem);

    this._saveMenuItem(menuItem);
  }

  private _saveMenuItem = (menuItem: MenuItem) => {
    Util.log(this.LOG_TAG, '_saveMenuItem()');

    this.busy = true;

    var requestData = new MenuItemAPIRequestData();

    MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuItemAPIRequestData.fillID(requestData, menuItem.ID);
    MenuItemAPIRequestData.fillMenuItem(requestData, menuItem);

    this.ROService.updateMenuItem(requestData).subscribe((response: any) => {

      this.busy = false;

      if (response.Status == this.constants.STATUS_SUCCESS) {
        this.toastr.success(`${menuItem.Name} updated successfully.`, 'Success!');
      }
      else {
        this.toastr.error('Unable to update item, Please try later.', 'Error!');
      }

      Util.log(this.LOG_TAG, 'updateMenuItem', response);
    });
  }

  deleteMenuItem = (menuItemIndex, menuItem: MenuItem) => {
    this.confirmModal.open({ message: `Are you sure you want to delete ${menuItem.Name}?` })
      .then((confirm) => {
        if (confirm) {
          Util.log(this.LOG_TAG, 'deleteMenuItem()');

          this.busy = true;

          var requestData = new ROAPIRequestData();

          ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
          ROAPIRequestData.fillID(requestData, menuItem.ID);

          this.ROService.deleteMenuItem(requestData).subscribe((response: any) => {

            this.busy = false;

            if (response.Status == this.constants.STATUS_SUCCESS) {
              this.menuItemList.splice(menuItemIndex, 1);

              this.toastr.success(`${menuItem.Name} deleted successfully.`, 'Success!');
            }
            else {
              this.toastr.error('Unable to delete item, Please try later.')
            }

            Util.log(this.LOG_TAG, 'deleteMenuItem', response);
          });
        }
      });
  }

  goBack = () => {
    this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, this.masterHeadID]);

    Util.log(this.LOG_TAG, 'goBack');
  }
}
