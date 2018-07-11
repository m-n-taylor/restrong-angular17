import { MenuItem } from './menu-item';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Order API Request Data
 */
export class OrderItemAPIRequestData extends UserAPIRequestData {
    public b: number; // order ID
    public c: number; // Restaurant ID
    public d: number; // Item ID
    //public e: string; // Item Name
    public f: number; // Qty
    public g: number; // Price
    public m: string; // menu Item Suggestion
    public s: number; // menu Item Size ID
    public o: Array<any>; // option items

    public static fillMenuItem = (requestData: OrderItemAPIRequestData, menuItem: MenuItem) => {
        requestData.c = menuItem.RestaurantID;
        requestData.d = menuItem.MenuItemID;
        requestData.f = menuItem.quantity;
        requestData.g = menuItem.Price;

        requestData.o = [];
        if (menuItem.menuItemOptions) {
            var item = menuItem;

            for (var optionIndex in item.menuItemOptions) {
                var menuItemOption = item.menuItemOptions[optionIndex];

                var option: any = {};
                option.OptionID = menuItemOption.OptionID;
                option.OptionHeader = menuItemOption.OptionHeader;
                option.OptionItems = [];

                if (menuItemOption.Is_Single_Select) {
                    var temp: any = {};
                    temp.ID = menuItemOption.selectedOptionItem.ID;
                    temp.Name = menuItemOption.selectedOptionItem.Name;
                    temp.Price = menuItemOption.selectedOptionItem.Price;
                    option.OptionItems.push(temp);
                }
                else {
                    for (var optionItemIndex in menuItemOption.OptionItems) {
                        var optionItem = menuItemOption.OptionItems[optionItemIndex];

                        if (optionItem.isSelected) {
                            var temp: any = {};
                            temp.ID = optionItem.ID;
                            temp.Name = optionItem.Name;
                            temp.Price = optionItem.Price;

                            option.OptionItems.push(temp);
                        }

                    }
                }

                requestData.o.push(option);
            }

        }
    }
}