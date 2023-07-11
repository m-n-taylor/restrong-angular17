/**
 * Menu Item
 */

export class MenuItem {
    public ID: number;
    public Name: string;
    public Description: string;
    public Price: number;
    public SortID: number;
    public FileName: any;
    public MenuImageExist: boolean;
    public Is_Single_Size: boolean = true;
    public Enabled: boolean;

    // Custom fields
    public _addSize: boolean;
    public quantity: number;
    public selectedMenuItemSize: any;
    public menuItemSizes: Array<any>;
    public menuItemOptions: Array<any>;
    public isSelected: boolean;
}
// update: 2025-08-01T01:03:08.536982

// update: 2025-08-01T01:08:48.599492
