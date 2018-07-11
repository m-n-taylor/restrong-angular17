import { MenuItemSize } from './menu-item-size';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Menu Item Size API Request Data
 */
export class MenuItemSizeAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public price: number; // Price
    public enabled: boolean; // Enabled
    public isdefault: boolean; // Is_Default

    public static fillMenuItemSize(requestData: MenuItemSizeAPIRequestData, menuItemSize: MenuItemSize) {
        requestData.name = menuItemSize.Name;
        requestData.des = menuItemSize.Description;
        requestData.price = menuItemSize.Price;
        requestData.enabled = menuItemSize.Enabled;
        requestData.isdefault = menuItemSize.Is_Default;
    }
}