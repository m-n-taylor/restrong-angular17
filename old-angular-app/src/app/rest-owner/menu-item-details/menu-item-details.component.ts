import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { RequestMethod, Http } from '@angular/http';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';
import { MenuItem } from '../shared/models/menu-item';
import { MenuItemAPIRequestData } from '../shared/models/menu-item-api-request-data';
import { MenuItemSize } from '../shared/models/menu-item-size';
import { MenuItemSizeAPIRequestData } from '../shared/models/menu-item-size-api-request-data';
import { MenuOption } from '../shared/models/menu-option';
import { MenuOptionAPIRequestData } from '../shared/models/menu-option-api-request-data';
import { MenuOptionItem } from '../shared/models/menu-option-item';
import { MenuOptionItemAPIRequestData } from '../shared/models/menu-option-item-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';
import { EventsService } from '../../shared/services/events.service';
import { InputService } from '../../shared/services/input.service';
import { BaseModal } from '../../shared/services/base-modal.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { HelperService } from '../shared/services/helper.service';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var document, google;

@Component({
  selector: 'menu-item-details',
  templateUrl: './menu-item-details.component.html',
  providers: []
})
export class MenuItemDetailsComponent implements OnInit {

  /**
   * Properties
   */
  LOG_TAG = 'MenuItemDetailsComponent';

  TAB_ITEM_INFO = 'TAB_ITEM_INFO';
  TAB_SIZE = 'TAB_SIZE';
  TAB_OPTION = 'TAB_OPTION';

  masterHeadID: number;
  headID: number;
  menuItemID: number;
  fireFlyID: string;

  restInfo = new Restaurant();
  masterHead: any = {};
  head: any = {};

  activeTab: string;

  isOpenOptionGroupSuggestion = false;
  selectedOptionGroupSuggestionItem: any;
  optionGroupSuggestionList = new Array<any>();

  private _originalMenuItem: MenuItem; // Will keeps reference to orignal object
  private _menuItem = new MenuItem();

  public get menuItem(): MenuItem {
    return this._menuItem;
  }
  public set menuItem(value: MenuItem) {
    this._originalMenuItem = value;
    this._menuItem = Util.clone(this._originalMenuItem);
  }

  menuItemSize = new MenuItemSize();
  oldDefaultMenuItemSize: MenuItemSize = null;
  menuItemSizeList = new Array<MenuItemSize>();

  menuOption = new MenuOption();
  menuOptionList = new Array<MenuOption>();
  isOpenMenuOption: boolean;

  menuOptionItem = new MenuOptionItem();
  menuOptionItemList = new Array<MenuOptionItem>();
  isOpenMenuOptionItem: boolean;

  busy = false;
  busyItemInfo = false;

  public get isNewMenuItem(): boolean {
    return !Util.isDefined(this.menuItem.ID);
  }

  // public get isNewMenuItemSize(): boolean {
  //   return !Util.isDefined(this.menuItemSize.ID);
  // }

  // public get isNewMenuOption(): boolean {
  //   return !Util.isDefined(this.menuOption.ID);
  // }

  @ViewChild('menuItemImageInput') menuItemImageInput: ElementRef;
  @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private router: Router, private activatedRoute: ActivatedRoute, public input: InputService, public zone: NgZone, private breadcrumbService: BreadcrumbService, public helperService: HelperService, private toastr: ToastsManager) {
  }

  /**
   * Methods
   */
  ngOnInit() {
    Util.log(this.LOG_TAG, 'Init()');

    if (isPlatformBrowser(this.platformId)) {
      this.initPage();
    }
  }

  initPage = () => {
    this.activatedRoute.params.subscribe((params: any) => {
      Util.log(this.LOG_TAG, 'params', params);

      this.menuItemID = params.id && params.id > 0 ? params.id : null;
      this.masterHeadID = params.masterHeadID;
      this.headID = params.headID;
      this.fireFlyID = params.fireFlyID;

      // if (this.menuItemID) {
      this.loadData();
      // }

      this.selectTab(this.TAB_ITEM_INFO);
    });
  }

  loadData = () => {
    Util.log(this.LOG_TAG, 'loadData()');

    this.busy = true;

    var promiseList = [];

    promiseList.push(this.loadRestInfo());
    promiseList.push(this.loadMasterHeadInfo());
    promiseList.push(this.loadHeadInfo());

    if (this.menuItemID) {
      promiseList.push(this.loadOptionGroupSuggestion());
      promiseList.push(this.loadMenuItemInfo());
      promiseList.push(this.loadMenuItemSizeList());
      promiseList.push(this.loadMenuOptionList());
    }

    Observable.forkJoin(promiseList).subscribe(response => {
      var restInfoResponse: any = response[0];
      this.restInfo = restInfoResponse.Data;

      var masterHeadInfoResponse: any = response[1];
      this.masterHead = masterHeadInfoResponse.Data;

      var headInfoResponse: any = response[2];
      this.head = headInfoResponse.Data;

      if (this.menuItemID) {

        var optionGroupSuggestionResponse: any = response[3];
        this.optionGroupSuggestionList = optionGroupSuggestionResponse.Data;

        var menuItemInfoResponse: any = response[4];
        this.menuItem = menuItemInfoResponse.Data;

        var menuItemSizeListResponse: any = response[5];
        this.menuItemSizeList = menuItemSizeListResponse.Data;

        var menuOptionListResponse: any = response[6];
        this.menuOptionList = menuOptionListResponse.Data;

      }

      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfo.Name);
      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.MENU_DETAILS}/${this.masterHeadID}`, this.masterHead.Name);
      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.MENU_DETAILS}/${this.masterHeadID}/${Path.RO.CATEGORY_DETAILS}/${this.headID}`, this.head.Name);
      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.MENU_DETAILS}/${this.masterHeadID}/${Path.RO.CATEGORY_DETAILS}/${this.headID}/${Path.RO.MENU_ITEM_DETAILS}/${this.menuItem.ID}`, this.menuItem.Name);

      this.busy = false;

      Util.log(this.LOG_TAG, 'loadData => forkJoin', response);
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

  loadMenuItemInfo = () => {
    var requestData = new MenuItemAPIRequestData();

    MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuItemAPIRequestData.fillID(requestData, this.menuItemID);

    return this.ROService.getMenuItemInfo(requestData);
  }

  selectTab = (tab) => {
    if (this.isNewMenuItem && tab != this.TAB_ITEM_INFO) {
      this.toastr.error('You need to save item info first.', 'Error!');
    }
    else {
      this.activeTab = tab;
    }

    if (this.activeTab == this.TAB_OPTION) {
      this.closeMenuOption();
    }
  }

  /**
   * Menu Item Size
   */
  loadMenuItemSizeList = () => {
    Util.log(this.LOG_TAG, 'loadMenuItemSizeList()');

    this.busy = true;

    var requestData = new MenuItemAPIRequestData();

    MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuItemAPIRequestData.fillMenuItemID(requestData, this.menuItemID);

    return this.ROService.getMenuItemSizeList(requestData);
  }

  public onMenuItemSizeDragSuccess(event) {
    Util.log(this.LOG_TAG, 'onMenuItemSizeDragSuccess', event, this.menuItemSizeList);

    this.helperService.calculateSortID(this.menuItemSizeList);

    this.saveMenuItemSizeSortOrder();
  }

  saveMenuItemSizeSortOrder = () => {
    this.busy = true;

    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

    var body = {
      SortDetails: []
    };

    for (var index in this.menuItemSizeList) {
      var menuItemSize = this.menuItemSizeList[index];

      body.SortDetails.push({
        ID: menuItemSize.ID,
        SortID: menuItemSize.SortID,
      });
    }

    this.ROService.updateMenuItemSizeSortOrder(requestData, body).subscribe(response => {
      this.busy = false;

      Util.log(this.LOG_TAG, 'updateMenuItemSizeSortOrder', response);
    });
  }

  addMenuItemSize = () => {
    var menuItemSize = new MenuItemSize();

    this.menuItemSizeList.push(menuItemSize);

    this.openMenuItemSize(menuItemSize);
  }

  openMenuItemSize = (menuItemSize: MenuItemSize) => {
    this.oldDefaultMenuItemSize = null;
    menuItemSize.editMode = true;

    this.menuItemSize = Util.clone(menuItemSize);
  }

  closeMenuItemSize = (menuItemSize: MenuItemSize, isCancel?: boolean) => {
    if (isCancel) {

      if (this.oldDefaultMenuItemSize) {
        this.oldDefaultMenuItemSize.Is_Default = true;
        this.menuItemSize.Is_Default = false;

        this.oldDefaultMenuItemSize = null;
      }

      Util.merge(menuItemSize, this.menuItemSize);
    }

    menuItemSize.editMode = false;

    if (Util.isNewObject(menuItemSize)) {
      var index = this.menuItemSizeList.indexOf(menuItemSize);

      if (index > -1) {
        this.menuItemSizeList.splice(index, 1);
      }
    }
  }

  setDefaultMenuItemSize = (menuItemSize: MenuItemSize) => {
    for (var index in this.menuItemSizeList) {
      var size = this.menuItemSizeList[index];

      if (!size.editMode && size.Is_Default) {
        this.oldDefaultMenuItemSize = size;
      }

      size.Is_Default = false;
    }

    menuItemSize.Is_Default = true;

    if (!menuItemSize.editMode) {
      this._saveMenuItemSize(menuItemSize);
    }
  }

  toggleActiveMenuItemSize = (menuItemSize: MenuItemSize) => {
    Util.log(this.LOG_TAG, 'toggleActiveMenuItemSize', menuItemSize);

    if (!menuItemSize.editMode) {
      this._saveMenuItemSize(menuItemSize);
    }
  }

  saveMenuItemSize = (menuItemSize: MenuItemSize, form) => {
    Util.log(this.LOG_TAG, 'saveMenuItemSize', form);

    if (form.valid) {
      this._saveMenuItemSize(menuItemSize, form);
    }
  }

  _saveMenuItemSize = (menuItemSize: MenuItemSize, form?) => {
    Util.log(this.LOG_TAG, '_saveMenuItemSize', form);

    this.busy = true;

    var requestData = new MenuItemSizeAPIRequestData();

    MenuItemSizeAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuItemSizeAPIRequestData.fillMenuItemSize(requestData, menuItemSize);
    MenuItemSizeAPIRequestData.fillMenuItemID(requestData, this.menuItem.ID);

    if (Util.isNewObject(menuItemSize)) {
      var request = this.ROService.addMenuItemSize(requestData);
    }
    else {
      MenuItemSizeAPIRequestData.fillID(requestData, menuItemSize.ID);

      var request = this.ROService.updateMenuItemSize(requestData);
    }

    request.subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        var isNew = Util.isNewObject(menuItemSize);

        if (isNew) {
          Util.merge(menuItemSize, response.Data);
        }

        this.closeMenuItemSize(menuItemSize);

        this.toastr.success(`${menuItemSize.Name} ${isNew ? 'added' : 'updated'} successfully.`, 'Success!');
      }
      else {
        if (response.Code == 'ERR_NAME_EXIST') {

          if (Util.isDefined(form)) {
            form.controls.Name.setErrors({ asyncInvalid: true, asyncInvalidMsg: ' already exist' });
          }

          this.toastr.error(`${menuItemSize.Name} already exist.`, 'Sorry!');
        }
      }

      this.busy = false;

      Util.log(this.LOG_TAG, 'addMenuItemSize', response);
    });
  }

  deleteMenuItemSize = (menuItemSizeIndex, menuItemSize: MenuItemSize) => {
    this.confirmModal.open({ message: `Are you sure you want to delete ${menuItemSize.Name}?` })
      .then((confirm) => {
        if (confirm) {
          Util.log(this.LOG_TAG, 'deleteMenuItemSize');

          this.busy = true;

          var requestData = new MenuItemSizeAPIRequestData();

          MenuItemSizeAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
          MenuItemSizeAPIRequestData.fillID(requestData, menuItemSize.ID);

          this.ROService.deleteMenuItemSize(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
              this.menuItemSizeList.splice(menuItemSizeIndex, 1);

              this.toastr.success(`${menuItemSize.Name} deleted successfully.`, 'Success!');
            }
            else {
              this.toastr.error(`Unable to delete item, Please try later.`, 'Sorry!');
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'deleteMenuItemSize', response);
          });
        }
      });
  }

  /**
   * Menu Option
   */

  loadOptionGroupSuggestion = () => {
    var requestData = new MenuItemAPIRequestData();

    MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

    return this.ROService.getOptionGroupSuggestion(requestData);
  }

  toggleOptionGroupSuggestion = () => {
    this.isOpenOptionGroupSuggestion = !this.isOpenOptionGroupSuggestion;
  }

  chooseOptionGroupSuggestionItem = (selectedItem) => {
    if (this.selectedOptionGroupSuggestionItem == selectedItem) {
      this.selectedOptionGroupSuggestionItem = null;
    }
    else {
      this.selectedOptionGroupSuggestionItem = selectedItem;
    }
  }

  chooseOptionGroupSuggestionItemDetail = (selectedItemDetail) => {
    selectedItemDetail.isActive = !selectedItemDetail.isActive;
  }

  saveSelectedOptionGroupSuggestion = () => {
    this.busy = true;

    var promiseList = [];

    var selectedItem = this.selectedOptionGroupSuggestionItem;

    var menuOption = new MenuOption();
    menuOption.Name = selectedItem.Name;

    this.openMenuOption(menuOption);

    this._saveMenuOption(menuOption).subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        Util.merge(menuOption, response.Data);

        this.menuOptionList.push(menuOption);

        for (var index in selectedItem.Details) {
          var item = selectedItem.Details[index];

          if (item.isActive) {
            var menuOptionItem = new MenuOptionItem();
            menuOptionItem.Name = item.Name;

            for (var index in this.menuItemSizeList) {
              var size = this.menuItemSizeList[index];

              menuOptionItem.SizeDetails.push({
                MenuSizeID: size.ID,
                Name: size.Name,
                Price: 0,
                id: 0,
              });
            }

            promiseList.push(this._saveMenuOptionItem(menuOptionItem));
          }
        }

        Observable.forkJoin(promiseList).subscribe((response: any) => {
          Util.log(this.LOG_TAG, 'saveSelectedOptionGroupSuggestion()', response);

          for (var index in response) {
            var item = response[index];

            if (item.Status == this.constants.STATUS_SUCCESS) {
              this.menuOptionItemList.push(item.Data);
            }
          }

          this.busy = false;
        });
      }
    });
  }

  loadMenuOptionList = () => {
    Util.log(this.LOG_TAG, 'loadMenuOptionList()');

    this.busy = true;

    var requestData = new MenuOptionAPIRequestData();

    MenuOptionAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuOptionAPIRequestData.fillMenuItemID(requestData, this.menuItemID);

    return this.ROService.getMenuOptionList(requestData);
  }

  public onMenuOptionDragSuccess(event) {
    Util.log(this.LOG_TAG, 'onMenuOptionDragSuccess', event, this.menuOptionList);

    this.helperService.calculateSortID(this.menuOptionList);

    this.saveMenuOptionSortOrder();
  }

  saveMenuOptionSortOrder = () => {
    this.busy = true;

    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

    var body = {
      SortDetails: []
    };

    for (var index in this.menuOptionList) {
      var menuOption = this.menuOptionList[index];

      body.SortDetails.push({
        ID: menuOption.ID,
        SortID: menuOption.SortID,
      });
    }

    this.ROService.updateMenuOptionSortOrder(requestData, body).subscribe(response => {
      this.busy = false;

      Util.log(this.LOG_TAG, 'updateMenuOptionSortOrder', response);
    });
  }

  openMenuOption = (menuOption: MenuOption) => {
    this.isOpenMenuOption = true;

    this.menuOption = menuOption || new MenuOption();

    this.menuOptionItemList = [];

    if (Util.isDefined(this.menuOption.ID)) {
      this.loadMenuOptionItemList();
    }
  }

  closeMenuOption = () => {
    this.isOpenMenuOption = null;

    this.menuOption = null;
  }

  toggleActiveMenuOption = (menuOption: MenuOption) => {
    Util.log(this.LOG_TAG, 'toggleActiveMenuOption', menuOption);

    this.saveMenuOption(menuOption);
  }

  private _saveMenuOption = (menuOption: MenuOption) => {
    var requestData = new MenuOptionAPIRequestData();

    MenuOptionAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuOptionAPIRequestData.fillMenuOption(requestData, menuOption);

    if (Util.isNewObject(menuOption)) {
      MenuOptionAPIRequestData.fillMenuItemID(requestData, this.menuItem.ID);

      var request = this.ROService.addMenuOption(requestData);
    }
    else {
      MenuOptionAPIRequestData.fillID(requestData, menuOption.ID);

      var request = this.ROService.updateMenuOption(requestData);
    }

    return request;
  }

  saveMenuOption = (menuOption: MenuOption) => {
    Util.log(this.LOG_TAG, 'saveMenuOption');

    this.busy = true;

    this._saveMenuOption(menuOption).subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        var isNew = Util.isNewObject(menuOption);

        // In case of New item, put it in the list
        if (isNew) {
          this.menuOptionList.push(response.Data);
        }

        this.toastr.success(`${menuOption.Name} ${isNew ? 'added' : 'updated'} successfully.`, 'Success!');
      }
      else {
        this.toastr.error(`Unable to ${isNew ? 'add' : 'update'} item, Please try later.`, 'Sorry!');
      }

      this.closeMenuOption();
      this.busy = false;

      Util.log(this.LOG_TAG, 'addMenuItemSize', response);
    });
  }

  deleteMenuOption = (menuOptionIndex, menuOption: MenuOption) => {
    this.confirmModal.open({ message: `Are you sure you want to delete ${menuOption.Name}?` })
      .then((confirm) => {
        if (confirm) {
          Util.log(this.LOG_TAG, 'deleteMenuOption');

          this.busy = true;

          var requestData = new MenuOptionAPIRequestData();

          MenuOptionAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
          MenuOptionAPIRequestData.fillID(requestData, menuOption.ID);

          this.ROService.deleteMenuOption(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
              this.menuOptionList.splice(menuOptionIndex, 1);
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'deleteMenuOption', response);
          });
        }
      });
  }

  loadMenuOptionItemList = () => {
    Util.log(this.LOG_TAG, 'loadMenuOptionItemList()');

    this.busy = true;

    var requestData = new MenuOptionAPIRequestData();

    MenuOptionAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuOptionAPIRequestData.fillMenuItemID(requestData, this.menuItem.ID);
    MenuOptionAPIRequestData.fillMenuOptionID(requestData, this.menuOption.ID);

    this.ROService.getMenuOptionItemList(requestData).subscribe(response => {
      this.menuOptionItemList = response;

      this.busy = false;

      Util.log(this.LOG_TAG, 'getMenuOptionItemList', response);
    });
  }

  public onMenuOptionItemDragSuccess(event) {
    Util.log(this.LOG_TAG, 'onMenuOptionItemDragSuccess', event, this.menuOptionItemList);

    this.helperService.calculateSortID(this.menuOptionItemList);

    this.saveMenuOptionItemSortOrder();
  }

  saveMenuOptionItemSortOrder = () => {
    this.busy = true;

    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

    var body = {
      SortDetails: []
    };

    for (var index in this.menuOptionItemList) {
      var menuOptionItem = this.menuOptionItemList[index];

      body.SortDetails.push({
        ID: menuOptionItem.ID,
        SortID: menuOptionItem.SortID,
      });
    }

    this.ROService.updateMenuOptionItemSortOrder(requestData, body).subscribe(response => {
      this.busy = false;

      Util.log(this.LOG_TAG, 'updateMenuOptionItemSortOrder', response);
    });
  }

  addMenuOptionItem = () => {
    if (Util.isNewObject(this.menuOption)) {
      this.toastr.error('You need to Save Option Category first', 'Sorry!');
    }
    else {
      var menuOptionItem = new MenuOptionItem();

      for (var index in this.menuItemSizeList) {
        var size = this.menuItemSizeList[index];

        menuOptionItem.SizeDetails.push({
          MenuSizeID: size.ID,
          Name: size.Name,
          Price: 0,
          id: 0,
        });
      }

      this.menuOptionItemList.push(menuOptionItem);

      this.openMenuOptionItem(menuOptionItem);
    }
  }

  openMenuOptionItem = (menuOptionItem: MenuOptionItem) => {
    menuOptionItem.editMode = true;

    this.menuOptionItem = Util.clone(menuOptionItem);
  }

  closeMenuOptionItem = (menuOptionItem: MenuOptionItem, isCancel?: boolean) => {
    if (isCancel) {
      Util.merge(menuOptionItem, this.menuOptionItem);
    }

    menuOptionItem.editMode = false;

    if (Util.isNewObject(menuOptionItem)) {

      var index = this.menuOptionItemList.indexOf(menuOptionItem);

      if (index > -1) {
        this.menuOptionItemList.splice(index, 1);
      }
    }
  }

  toggleActiveMenuOptionItem = (menuOptionItem: MenuOptionItem) => {
    Util.log(this.LOG_TAG, 'toggleActiveMenuOptionItem', menuOptionItem);

    if (!Util.isNewObject(menuOptionItem)) {
      this.saveMenuOptionItemHelper(menuOptionItem);
    }
  }

  _saveMenuOptionItem = (menuOptionItem: MenuOptionItem) => {
    var requestData = new MenuOptionItemAPIRequestData();

    MenuOptionItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuOptionItemAPIRequestData.fillMenuOptionItem(requestData, menuOptionItem);
    MenuOptionAPIRequestData.fillMenuOptionID(requestData, this.menuOption.ID);
    MenuOptionAPIRequestData.fillMenuItemID(requestData, this.menuItemID);

    requestData.SizeDetails = menuOptionItem.SizeDetails;

    if (Util.isNewObject(menuOptionItem)) {
      var request = this.ROService.addMenuOptionItem(requestData);
    }
    else {
      MenuOptionAPIRequestData.fillID(requestData, menuOptionItem.ID);

      var request = this.ROService.updateMenuOptionItem(requestData);
    }

    return request;
  };

  saveMenuOptionItem = (menuOptionItem: MenuOptionItem, form) => {
    Util.log(this.LOG_TAG, 'saveMenuOptionItem', form);

    if (form.valid) {
      this.saveMenuOptionItemHelper(menuOptionItem);
    }
  }

  saveMenuOptionItemHelper = (menuOptionItem: MenuOptionItem) => {
    this.busy = true;

    this._saveMenuOptionItem(menuOptionItem).subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        var isNew = Util.isNewObject(menuOptionItem);

        // In case of New item, put it in the list
        if (isNew) {
          this.menuOptionItemList.push(response.Data);
        }
        else {
          Util.merge(menuOptionItem, response.Data);
        }

        this.toastr.success(`${menuOptionItem.Name} ${isNew ? 'added' : 'updated'} successfully.`, 'Success!');
      }
      else {
        this.toastr.error(`Unable to ${isNew ? 'add' : 'update'} item, Please try later.`, 'Error!');
      }

      this.closeMenuOptionItem(menuOptionItem);

      this.busy = false;

      Util.log(this.LOG_TAG, 'saveMenuOptionItem', response);
    });
  }

  deleteMenuOptionItem = (menuOptionIndex, menuOptionItem: MenuOptionItem) => {
    this.confirmModal.open({ message: `Are you sure you want to delete ${menuOptionItem.Name}?` })
      .then((confirm) => {
        if (confirm) {

          Util.log(this.LOG_TAG, 'deleteMenuOptionItem');

          this.busy = true;

          var requestData = new MenuOptionItemAPIRequestData();

          MenuOptionItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
          MenuOptionItemAPIRequestData.fillID(requestData, menuOptionItem.ID);

          this.ROService.deleteMenuOptionItem(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
              this.menuOptionItemList.splice(menuOptionIndex, 1);
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'deleteMenuOption', response);
          });
        }
      });
  }

  uploadMenuItemImage = () => {
    Util.log(this.LOG_TAG, 'uploadMenuItemImage');

    let inputElement: HTMLInputElement = this.menuItemImageInput.nativeElement;

    let fileCount: number = inputElement.files.length;

    let formData = new FormData();

    // a file was selected
    if (fileCount > 0) {
      var file = inputElement.files.item(0);

      if (this.constants.RO_ALLOWED_IMG_TYPES.indexOf(file.type) == -1) {
        inputElement.value = '';

        this.toastr.error('Invalid file format. Only PNG and JPG are allowed.', 'Sorry!');
      }
      else if (file.size > Util.getBytesByMb(this.constants.RO_MAX_IMG_SIZE)) {
        inputElement.value = '';

        this.toastr.error(`File size can't be greater then ${this.constants.RO_MAX_IMG_SIZE}MB.`, 'Sorry!');
      }
      else {
        formData.append('file[]', file);

        var requestData = new MenuOptionItemAPIRequestData();

        MenuOptionAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        MenuOptionAPIRequestData.fillID(requestData, this.menuItemID);

        this.ROService.uploadMenuItemImage(requestData, formData).subscribe((response) => {

          if (response.Status == this.constants.STATUS_SUCCESS) {
            this.menuItem.FileName = response.FileName + '&r=' + new Date().getTime();
            this.menuItem.MenuImageExist = true;
          }

          Util.log(this.LOG_TAG, 'uploadMenuItemImage', response);

        });

        Util.log(this.LOG_TAG, 'formData', formData);
      }
    }
  }

  deleteMenuItemImage = () => {
    Util.log(this.LOG_TAG, 'deleteMenuItemImage');

    let inputElement: HTMLInputElement = this.menuItemImageInput.nativeElement;

    inputElement.value = '';

    this.busy = true;

    var requestData = new MenuItemAPIRequestData();

    MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuItemAPIRequestData.fillID(requestData, this.menuItem.ID);

    this.ROService.deleteMenuItemImage(requestData).subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        this.menuItem.FileName = null;
        this.menuItem.MenuImageExist = false;
      }

      this.busy = false;

      Util.log(this.LOG_TAG, 'deleteMenuItemImage', response);
    });
  }

  save = (form) => {
    Util.log(this.LOG_TAG, 'save', form);

    this.busyItemInfo = true;

    var requestData = new MenuItemAPIRequestData();

    MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    MenuItemAPIRequestData.fillMenuItem(requestData, this.menuItem);

    if (this.isNewMenuItem) {
      MenuItemAPIRequestData.fillHeadID(requestData, this.headID);

      var request = this.ROService.addMenuItem(requestData);
    }
    else {
      MenuItemAPIRequestData.fillID(requestData, this.menuItem.ID);

      var request = this.ROService.updateMenuItem(requestData);
    }

    request.subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        var isNew = this.isNewMenuItem;

        if (isNew) {
          var menuItem: MenuItem = response.Data;

          this.menuItem = menuItem;

          this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, this.masterHeadID, Path.RO.CATEGORY_DETAILS, this.headID, Path.RO.MENU_ITEM_DETAILS, menuItem.ID]);
        }
        else {
          Util.merge(this._originalMenuItem, this.menuItem);
        }

        this.toastr.success(`${this.menuItem.Name} ${isNew ? 'added' : 'updated'} successfully.`, 'Success!');
      }
      else {
        this.toastr.error(`Unable to ${isNew ? 'add' : 'update'} item, Please try later.`, 'Sorry!');
      }

      this.busyItemInfo = false;

      Util.log(this.LOG_TAG, 'saveMenuItem', response);
    });
  }

  goBack = () => {
    this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, this.masterHeadID, Path.RO.CATEGORY_DETAILS, this.headID]);
  }

  close = () => {
    this.modalEvents.emit({
      action: BaseModal.EVENT_MODAL_CLOSE,
      data: {}
    });
  }
}