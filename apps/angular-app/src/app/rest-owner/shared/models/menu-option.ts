/**
 * Menu Option
 */

import { MenuOptionItem } from "./menu-option-item";

export class MenuOption {
    public ID: number;
    public Name: string;
    public Description: string;
    public Is_Single_Size: boolean;
    public Is_Single_Select: boolean = true;
    public Minimum_Select: number;
    public Maximum_Select: number;
    public Is_Quantity_Select: boolean;
    public Minimum_Quantity: number;
    public Maximum_Quantity: number;
    public Enabled: boolean;
    public SortID: number;
    public OptionID: number;
    public OptionHeader: string;
    public OptionItems = Array<MenuOptionItem>();
    public selectedOptionItem: MenuOptionItem;

    // custom fields
    public totalSelectedOptionItems: number;
}