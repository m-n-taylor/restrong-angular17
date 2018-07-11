import { Util } from "../../../shared/util";

import { MenuOptionItem } from './menu-option-item';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Menu Option Item API Request Data
 */
export class MenuOptionItemAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public price: number;
    public enabled: boolean;
    public isdefault: boolean;

    public SizeDetails: any;

    public static fillMenuOptionItem(requestData: MenuOptionItemAPIRequestData, menuOptionItem: MenuOptionItem) {
        if (Util.isDefined(menuOptionItem.Name)) requestData.name = menuOptionItem.Name;
        if (Util.isDefined(menuOptionItem.Price)) requestData.price = menuOptionItem.Price;
        if (Util.isDefined(menuOptionItem.Enabled)) requestData.enabled = menuOptionItem.Enabled;
        if (Util.isDefined(menuOptionItem.Is_Default)) requestData.isdefault = menuOptionItem.Is_Default;
    }
}