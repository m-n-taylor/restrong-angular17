import { IChatMessage } from './IChatMessage';

export interface IChatThread {
    ID?: number;
    GuestID?: number;
    GuestName?: string;
    CustomerID?: number;
    CustomerName?: string;
    RestUserID?: number;
    RestUserName?: string;
    UserID?: number;
    UserName?: string;
    OrderNumber?: string;
    Closed?: boolean;
    Type? : number;

    // Custom properties
    hidden?: boolean;
    count?: number;
    image?: string;
    userOnline?: boolean;
    isOtherOnline?: boolean;
    messages?: Array<IChatMessage>;
}
// update: 2025-07-31T20:21:53.050686
