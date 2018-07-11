import { MenuItem } from './menu-item';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Menu Item API Request Data
 */
export class MenuItemAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public price: number; // Price
    public ss: boolean; // Is_Single_Size
    public sortid: number; // Sort ID

    public static fillMenuItem(requestData: MenuItemAPIRequestData, menuItem: MenuItem) {
        requestData.name = menuItem.Name;
        requestData.des = menuItem.Description;
        requestData.price = menuItem.Price;
        requestData.ss = menuItem.Is_Single_Size;
        requestData.sortid = menuItem.SortID;
        requestData.enabled = menuItem.Enabled;
    }
}