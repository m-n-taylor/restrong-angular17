import { Util } from "../../../shared/util";

import { MenuOption } from './menu-option';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Menu Option API Request Data
 */
export class MenuOptionAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public ss: boolean; // Is_Single_Size
    public min_select: number;
    public max_select: number;
    public qs: boolean;
    public min_quantity: number;
    public max_quantity: number;
    public enabled: boolean;

    public static fillMenuOption(requestData: MenuOptionAPIRequestData, menuOption: MenuOption) {
        if (Util.isDefined(menuOption.Name)) requestData.name = menuOption.Name;
        if (Util.isDefined(menuOption.Description)) requestData.des = menuOption.Description;
        if (Util.isDefined(menuOption.Is_Single_Select)) requestData.ss = menuOption.Is_Single_Select;
        if (Util.isDefined(menuOption.Minimum_Select)) requestData.min_select = menuOption.Minimum_Select;
        if (Util.isDefined(menuOption.Maximum_Select)) requestData.max_select = menuOption.Maximum_Select;
        if (Util.isDefined(menuOption.Is_Quantity_Select)) requestData.qs = menuOption.Is_Quantity_Select;
        if (Util.isDefined(menuOption.Minimum_Quantity)) requestData.min_quantity = menuOption.Minimum_Quantity;
        if (Util.isDefined(menuOption.Maximum_Quantity)) requestData.max_quantity = menuOption.Maximum_Quantity;
        requestData.enabled = menuOption.Enabled || false;
    }
}