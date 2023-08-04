import { IChatThread } from './IChatThread';
import { BaseUser } from '../../node-server/src/model/base-user.model';

export interface ISocket {
    id: string;
    on: any;
    join: any;
    leave: any;
    emit: any;
    disconnect: any;
}

export interface ISocketServer extends ISocket {
    lastMessageSent: string;
    rooms: any;
    orderNumber: string;
    userType: string;
    handshake: any;
    user: BaseUser;
    thread: IChatThread;
    threads: Array<IChatThread>;
}
// update: 2025-08-01T01:03:34.618905

// update: 2025-08-01T01:09:44.388490
