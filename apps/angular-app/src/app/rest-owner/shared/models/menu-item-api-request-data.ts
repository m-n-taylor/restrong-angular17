import { ROAPIRequestData } from './ro-api-request-data';
import { ROMenuItem } from "./ro-menu-item";

/**
 * Menu Item API Request Data
 */
export class MenuItemAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public price: number; // Price
    public ss: boolean; // Is_Single_Size
    public sortid: number; // Sort ID
    public showimageingallery: boolean; // Show Image In Gallery

    public static fillMenuItem(requestData: MenuItemAPIRequestData, menuItem: ROMenuItem) {
        requestData.name = menuItem.Name;
        requestData.des = menuItem.Description;
        requestData.price = menuItem.Price;
        requestData.ss = menuItem.Is_Single_Size;
        requestData.sortid = menuItem.SortID;
        requestData.enabled = menuItem.Enabled || false;
        requestData.showimageingallery = menuItem.ShowImageInGallery || false;
    }
}