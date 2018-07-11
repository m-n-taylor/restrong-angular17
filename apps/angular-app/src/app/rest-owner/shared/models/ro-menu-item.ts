import { MenuOption } from "./menu-option";

export class ROMenuItem {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
    SortID: number;
    FileName: any;
    MenuImageExist: boolean;
    Is_Single_Size: boolean;
    Enabled: boolean;
    ShowImageInGallery: boolean;

    //Custom fields
    _addSize: boolean;
    totalPrice: number;
    quantity: number;
    selectedMenuItemSize: any;
    menuItemSizes: Array<any>;
    menuItemOptions: Array<MenuOption>;
    isSelected: boolean;
    busy: boolean;
}