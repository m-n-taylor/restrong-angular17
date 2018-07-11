import { ChatMessage } from "./chat-message.model";
import { ChatThread } from "./chat-thread.model";

export class ChatThreadSupport extends ChatThread {
    GuestID: string;
    GuestName: string;
    GuestEmail: string;
    
    CustomerID: number;
    CustomerName: string;
    UserID: number;
    UserName: string;
    OrderNumber: string;
}