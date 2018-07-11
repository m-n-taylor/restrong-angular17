export class OrderMenuOptionDetail {
    SizeID: number;
    OptionID: number;
    OptionItemID: number;
    OptionItemName: string;
    Qty: number;
    Amount: number;
    Total: number;
    OptionItem: Array<OrderMenuOptionDetail>;
}