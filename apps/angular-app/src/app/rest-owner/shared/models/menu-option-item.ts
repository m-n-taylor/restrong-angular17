/**
 * Menu Option Item
 */

export class MenuOptionItem {
    public ID: number;
    public Name: string;
    public Is_Default: boolean;
    public Price: number;
    public SortID: number;
    public Enabled: boolean;
    public SizeDetails: Array<any> = [];

    // custom fields
    public isSelected: boolean;
    public editMode: boolean;
}
// update: 2025-08-01T01:05:44.902608
