import * as sql from "mssql";

import { IChatMessage } from '../../../shared/interface/IChatMessage';
import { Util } from "../util";

export class DB {
    LOG_TAG = 'DB';

    // Find Customer By AuthCode
    public findCustomerByAuthCode = (authCode: string) => {
        return new sql.Request()
            .input('AuthCode', sql.VarChar, authCode)
            .query('SELECT * FROM Lookup_Customers WHERE AuthCode = @AuthCode');
    }

    // Find Customer Order
    public findCustomerOrder = (orderNumber: string, customerID: number) => {
        return new sql.Request()
            .input('OrderNumber', sql.VarChar, orderNumber)
            .input('CustomerID', sql.Int, customerID)
            .query('SELECT * FROM Lookup_Customers_Orders WHERE OrderNumber = @OrderNumber AND CustomerID = @CustomerID');
    }

    // Find User By AuthCode
    public findUserByAuthCode = (authCode: string) => {
        // Make sure, the `User Level` is Agent or Agent-Admin // AND (UserLevel = 7 OR UserLevel = 8)
        return new sql.Request()
            .input('AuthCode', sql.VarChar, authCode)
            .query('SELECT * FROM Lookup_Users WHERE AuthCode = @AuthCode');
    }

    // Find User Restaurant Data
    public findUserRestData = (userID: any) => {
        // Make sure, the `User Level` is Agent or Agent-Admin
        return new sql.Request()
            .input('UserID', sql.Int, userID)
            .query('SELECT * FROM Lookup_User_Restaurant_Data WHERE UserID = @UserID');
    }

    // // Find Thread for Customer Order
    // public findCustomerOrderThread = (orderNumber, customerID) => {
    //     return new sql.Request()
    //         .input('OrderNumber', sql.VarChar, orderNumber)
    //         .input('CustomerID', sql.Int, customerID)
    //         .query('SELECT * FROM Lookup_ChatThreads WHERE OrderNumber = @OrderNumber AND CustomerID = @CustomerID');
    // }

    // Find Thread Order
    public findThreadsOrder = (options: any) => {
        Util.log(this.LOG_TAG, 'findThreadsOrder', options);

        var request = new sql.Request();

        // var query = `
        //                 SELECT ct.ID, ct.OrderNumber, ct.Closed, ct.UserID, ct.CustomerID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName, CONCAT(u.FirstName, ' ', u.LastName) as UserName
        //                 FROM Lookup_ChatThreads ct
        //                 LEFT JOIN Lookup_Customers c
        //                 ON c.ID = ct.CustomerID
        //                 LEFT JOIN Lookup_Users u
        //                 ON u.ID = ct.UserID

        //                 WHERE ct.Closed = 0
        //             `;

        var query = `
                        SELECT ct.ID, ct.Type, ct.TypeDataID, ctsd.OrderNumber, ct.Closed, ctsd.UserID, ctsd.CustomerID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName, CONCAT(u.FirstName, ' ', u.LastName) as UserName
                        FROM Lookup_ChatThreadOrderData ctsd
                        LEFT JOIN Lookup_ChatThreads ct
                        ON ct.TypeDataID = ctsd.ID
                        LEFT JOIN Lookup_Customers c
                        ON c.ID = ctsd.CustomerID
                        LEFT JOIN Lookup_Users u
                        ON u.ID = ctsd.UserID
                                                
                        WHERE ct.Closed = 0
                    `;


        // User ID
        if (typeof options.userID !== 'undefined') {
            if (options.userID) {
                request.input('UserID', sql.Int, options.userID);

                // query = `
                //             ${query}
                //             AND ct.UserID = @UserID
                //         `;

                query = `
                            ${query}
                            AND ctsd.UserID = @UserID
                        `;
            }
            else {
                // query = `
                //             ${query}
                //             AND ct.UserID IS NULL
                //         `;

                query = `
                            ${query}
                            AND ctsd.UserID IS NULL
                        `;
            }
        }

        // Customer ID
        if (typeof options.customerID !== 'undefined') {
            if (options.customerID) {
                request.input('CustomerID', sql.Int, options.customerID);

                // query = `
                //             ${query}
                //             AND ct.CustomerID = @CustomerID
                //         `;

                query = `
                            ${query}
                            AND ctsd.CustomerID = @CustomerID
                        `;
            }
        }

        // Order ID
        if (typeof options.orderNumber !== 'undefined') {
            if (options.orderNumber) {
                request.input('OrderNumber', sql.VarChar, options.orderNumber);

                // query = `
                //             ${query}
                //             AND ct.OrderNumber = @OrderNumber
                //         `;

                query = `
                            ${query}
                            AND ctsd.OrderNumber = @OrderNumber
                        `;
            }
        }

        // Util.log(this.LOG_TAG,'findThread => query', query);

        return request.query(query);
    }

    // Find Thread Support
    public findThreadsSupport = (options: any) => {
        Util.log(this.LOG_TAG, 'findThreadsSupport', options);

        var request = new sql.Request();

        var query = `
                        SELECT ct.ID, ct.Closed, ct.Type, ct.TypeDataID, ctsd.GuestID, ctsd.UserID, ctsd.GuestName, ctsd.GuestEmail, ctsd.RestUserID, ctsd.CustomerID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName, CONCAT(u.FirstName, ' ', u.LastName) as UserName, CONCAT(ru.FirstName, ' ', ru.LastName) as RestUserName
                        FROM Lookup_ChatThreadSupportData ctsd
                        LEFT JOIN Lookup_ChatThreads ct
                        ON ct.TypeDataID = ctsd.ID
                        LEFT JOIN Lookup_Customers c
                        ON c.ID = ctsd.CustomerID
                        LEFT JOIN Lookup_Users u
                        ON u.ID = ctsd.UserID
                        LEFT JOIN Lookup_Users ru
                        ON ru.ID = ctsd.RestUserID
                                                
                        WHERE ct.Closed = 0
                    `;

        // Customer ID
        if (typeof options.ID !== 'undefined') {
            if (options.ID) {
                request.input('ID', sql.Int, options.ID);

                query = `
                            ${query}
                            AND ct.ID = @ID
                        `;
            }
        }

        // User ID
        if (typeof options.userID !== 'undefined') {
            if (options.userID) {
                request.input('UserID', sql.Int, options.userID);

                query = `
                            ${query}
                            AND ctsd.UserID = @UserID
                        `;
            }
            else {
                query = `
                            ${query}
                            AND ctsd.UserID IS NULL
                        `;
            }
        }

        // Customer ID
        if (typeof options.customerID !== 'undefined') {
            if (options.customerID) {
                request.input('CustomerID', sql.Int, options.customerID);

                query = `
                            ${query}
                            AND ctsd.CustomerID = @CustomerID
                        `;
            }
        }

        // Util.log(this.LOG_TAG,'findThread => query', query);

        return request.query(query);
    }

    // Close Thread
    public closeThread = (id: number) => {
        return new sql.Request()
            .input('ID', sql.Int, id)
            .query('UPDATE Lookup_ChatThreads SET Closed = 1 WHERE ID = @ID');
    }

    // Creates New Thread for Customer Order
    public createChatThread = (type: number, typeDataID: number) => {
        return new sql.Request()
            .input('Type', sql.VarChar, type)
            .input('TypeDataID', sql.Int, typeDataID)
            .query('INSERT INTO Lookup_ChatThreads (Type, TypeDataID, DateCreated) VALUES (@Type, @TypeDataID, GETUTCDATE()); SELECT @@IDENTITY AS ID');
    }

    // Creates Chat Threads Order Data
    public createChatThreadOrderData = (orderNumber: string, customerID: number) => {
        return new sql.Request()
            .input('OrderNumber', sql.VarChar, orderNumber)
            .input('CustomerID', sql.Int, customerID)
            .query('INSERT INTO Lookup_ChatThreadOrderData (OrderNumber, CustomerID) VALUES (@OrderNumber, @CustomerID); SELECT @@IDENTITY AS ID');
    }

    // Creates Chat Threads Support Data
    public createChatThreadsSupportData = (options: any) => {
        Util.log(this.LOG_TAG, 'createChatThreadsSupportData', options);

        var query = null;

        query = new sql.Request()
            .input('CustomerID', sql.Int, options.customerID)
            .input('RestUserID', sql.Int, options.restUserID)
            .input('GuestID', sql.VarChar, options.GuestID)
            .input('GuestName', sql.VarChar, options.GuestName)
            .input('GuestEmail', sql.VarChar, options.GuestEmail)
            .input('GuestPhone', sql.VarChar, options.GuestPhone)
            .query('INSERT INTO Lookup_ChatThreadSupportData (CustomerID, RestUserID, GuestID, GuestName, GuestEmail, GuestPhone) VALUES (@CustomerID, @RestUserID, @GuestID, @GuestName, @GuestEmail, @GuestPhone); SELECT @@IDENTITY AS ID');

        return query;
    }

    // Find Chat Messages By ThreadID
    public findChatMessagesByThreadID = (threadID: any) => {
        return new sql.Request()
            .input('ThreadID', sql.Int, threadID)
            .query('SELECT * FROM Lookup_ChatMessages WHERE ThreadID = @ThreadID');
    }

    // Creates New Chat Message
    public createChatMessage = (message: IChatMessage) => {
        new sql.Request()
            .input('ThreadID', sql.Int, message.ThreadID)
            .input('Message', sql.Text, message.Message)
            .input('SenderType', sql.VarChar, message.SenderType)
            .query('INSERT INTO Lookup_ChatMessages (ThreadID, Message, SenderType, DateCreated) VALUES (@ThreadID, @Message, @SenderType, GETUTCDATE()); SELECT @@IDENTITY AS ID')
            .then((result) => {
                Util.log(this.LOG_TAG, 'new inserted message', result.recordset);
            });
    }

    // Assign User to Thread Orders
    public assignUserToThreadOrders = (id: any, userID: any) => {
        return new sql.Request()
            .input('ID', sql.Int, id)
            .input('UserID', sql.Int, userID)
            .query('UPDATE Lookup_ChatThreadOrderData SET UserID = @UserID WHERE ID = @ID');
    }

    // Assign User to Thread Support
    public assignUserToThreadSupport = (id: any, userID: any) => {
        return new sql.Request()
            .input('ID', sql.Int, id)
            .input('UserID', sql.Int, userID)
            .query('UPDATE Lookup_ChatThreadSupportData SET UserID = @UserID WHERE ID = @ID');
    }

    // Get `MAX_CUSTOMERS_PER_USER`
    public getMaxCustomersPerUser = () => {
        return new sql.Request()
            .query(`SELECT * FROM Lookup_ChatSettings WHERE [Key] = 'MAX_CUSTOMERS_PER_USER'`);
    }

    // Get Welcome Message for customer
    public getWelcomeMessageForCustomer = () => {
        return new sql.Request()
            .query(`SELECT * FROM Lookup_ChatTemplates WHERE [Key] = 'MSG_WELCOME'`);
    }

    // Get Message templates
    public getMessageTemplates = () => {
        return new sql.Request()
            .query(`SELECT * FROM Lookup_ChatTemplates`);
    }

    // Get Platform Company
    public findPlatformCompany = (columns: Array<string>, options: any) => {
        Util.log(this.LOG_TAG, 'findPlatformCompany', options);

        var request = new sql.Request();

        var query = `
                        SELECT ${columns.join(',')}
                        FROM Lookup_PlatformCompanies
                    `;

        // ID
        if (typeof options.ID !== 'undefined') {
            if (options.ID || options.ID === 0) {
                request.input('ID', sql.Int, options.ID);

                query = `
                            ${query}
                            WHERE ID = @ID
                        `;
            }
        }

        // Public Key
        if (typeof options.publicKey !== 'undefined') {
            if (options.publicKey) {
                request.input('PublicKey', sql.VarChar, options.publicKey);

                query = `
                            ${query}
                            WHERE PublicKey = @PublicKey
                        `;
            }
        }

        return request.query(query);
    }
}