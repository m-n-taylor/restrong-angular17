import { ROMenuItem } from "./ro-menu-item";
import { MenuItem } from "../../../shared/models/menu-item";
import { OrderMenuOptionDetail } from "./order-menu-option-detail";

export class MenuDetail {
    ID: number;
    OrderID: number;
    ItemID: number;
    SizeID: number;
    ItemName: string;
    Qty: number;
    Price: number;
    Amount: number;
    Instructions: string;
    OptionData_Display: string;
    CustomerRating: any;
    CustomerComment: string;
    SoldOutAction: any;
    OptionDetails: Array<OrderMenuOptionDetail>;

    // custom properties
    menuItem: ROMenuItem;
    crMenuItem: MenuItem;
    shouldDelete: boolean;
}