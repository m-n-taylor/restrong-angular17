import * as sql from 'mssql';
import axios from 'axios';

import { Util } from "../util";
import { Socket } from "./socket.model";
import { DB } from "./Database.model";
import { User } from "./user.model";
import { Chat } from "./chat.model";
import { Constants } from "../constants";
import { ChatMessage } from "./chat-message.model";

export class OrdersChat {
    LOG_TAG = 'OrdersChat';

    /**
     * constructor
     */
    constructor(private chat: Chat, private nps: any, private constants: Constants, private db: DB, private guestSocketList: Array<Socket>, private customerSocketList: Array<Socket>, private restUserSocketList: Array<Socket>, private userSocketList: Array<Socket>) {

    }

    /**
     * Middleware Thread Type Orders
     */
    public useMiddleware = async (socket: Socket, next: any) => {
        Util.log(this.LOG_TAG, 'middlewareThreadTypeOrders');

        var query = socket.handshake.query;
        var userType = query.userType;
        var authCode = query.authCode;

        var isAuthenticated = false;

        if (userType == 'customer') {

            var isCustomerAuthenticated = await this.chat.authenticateCustomer(socket);

            if (isCustomerAuthenticated) {
                socket.orderNumber = query.orderNumber;

                // Verify whether this `orderNumber` belongs to this `Customer` or not....
                var customerOrderResult = await this.db.findCustomerOrder(socket.orderNumber, socket.user.ID);
                if (customerOrderResult.recordset.length > 0) {

                    var orderDB = customerOrderResult.recordset[0];

                    var url = `${Constants.API_URL}/api/b/w.aspx?key=API_TEST_KEY&o=${orderDB.ID}&x=${authCode}&i=${socket.user.ID}`;
                    Util.log(this.LOG_TAG, 'ordersURL', url);

                    var ordersResponse = await axios.get(url);

                    if (ordersResponse.data instanceof Array && ordersResponse.data.length > 0) {
                        var orderAPI = ordersResponse.data[0];

                        isAuthenticated = orderAPI.AllowChat;
                    }

                    Util.log(this.LOG_TAG, 'ordersResponse', ordersResponse.data);
                }
            }

            Util.log(this.LOG_TAG, 'middlewareThreadTypeOrders', 'isAuthenticated', isAuthenticated);
        }

        return isAuthenticated;
    }

    /**
     * On Connection
     */
    public onConnection = async (socket: Socket) => {
        if (socket.userType == 'customer') {
            var threadsResult = await this.db.findThreadsOrder({
                orderNumber: socket.orderNumber,
                customerID: socket.user.ID
            });

            // If thread exists
            if (threadsResult.recordset.length > 0) {
                socket.thread = threadsResult.recordset[0];
                this.chat.connectCustomer(socket);

                Util.log('Thread Already Exist', threadsResult.recordset);
            }
            else {
                // If thread DONT exists
                Util.log('Thread NOT Exist', threadsResult.recordset);

                var orderDataResult = await this.db.createChatThreadOrderData(socket.orderNumber, socket.user.ID);
                if (orderDataResult.recordset.length > 0) {
                    var typeDataID = orderDataResult.recordset[0].ID;

                    var chatThreadResult = await this.db.createChatThread(this.constants.CHAT_THREAD_TYPE_ORDERS, typeDataID);

                    var threadsResult = await this.db.findThreadsOrder({
                        orderNumber: socket.orderNumber,
                        customerID: socket.user.ID
                    });

                    socket.thread = threadsResult.recordset[0];
                    this.chat.connectCustomer(socket);

                    Util.log('New Thread Created', threadsResult.recordset);
                }

                Util.log(this.LOG_TAG, 'orderDataResult', orderDataResult.recordset[0]);
            }
        }
    }
}