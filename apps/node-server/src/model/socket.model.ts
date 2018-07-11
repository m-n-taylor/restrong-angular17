import { BaseUser } from "./base-user.model";
import { ChatThread } from "./chat-thread.model";

export class Socket {
    id: string;
    on: any;
    join: any;
    leave: any;
    emit: any;
    disconnect: any;

    lastMessageSent: string;
    rooms: any;
    orderNumber: string;
    userType: string;
    handshake: any;
    user: BaseUser;
    // threadType: number;
    thread: ChatThread;
    threads: Array<ChatThread>;
    joinedTimestamp: number;
}