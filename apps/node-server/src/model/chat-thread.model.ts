import { ChatMessage } from "./chat-message.model";

export class ChatThread {
    ID: number;
    Closed: boolean;
    DateCreated: string;
    Type: number;
    TypeDataID: number;

    GuestID: string;
    RestUserID: number;
    RestUserName: string;
    CustomerID: number;
    CustomerName: string;
    UserID: number;
    UserName: string;
    OrderNumber: string;
}