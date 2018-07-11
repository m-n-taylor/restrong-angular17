import { Component, Input, Output, EventEmitter } from '@angular/core';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// Shared Services
import { SharedDataService } from '../../services/shared-data.service';

@Component({
    selector: 'menu-item',
    templateUrl: './menu-item.component.html',
})
export class MenuItemComponent {
    LOG_TAG = 'MenuItemComponent';

    public static ACTION_VIEW_MENU = 'ACTION_VIEW_MENU';
    public static ACTION_VIEW_ADD_CART = 'ACTION_VIEW_ADD_CART';
    public static ACTION_VIEW_MORE_DISHES = 'ACTION_VIEW_MORE_DISHES';

    ACTION_VIEW_MENU = MenuItemComponent.ACTION_VIEW_MENU;
    ACTION_VIEW_ADD_CART = MenuItemComponent.ACTION_VIEW_ADD_CART;
    ACTION_VIEW_MORE_DISHES = MenuItemComponent.ACTION_VIEW_MORE_DISHES;

    sharedData = {};

    @Input() config: any = {};
    @Input() item: any;
    @Output() menuItemClicked: EventEmitter<any> = new EventEmitter<any>();

    constructor(public constants: Constants, public sharedDataService: SharedDataService) {
    }

    ngOnInit() {
    }

    doAction = (event: Event, action) => {
        if (action == this.ACTION_VIEW_ADD_CART || action == this.ACTION_VIEW_MORE_DISHES) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.menuItemClicked.emit({
            action: action,
            menuItem: this.item
        });
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }
}