// playground requires you to assign document definition to a variable called dd

var dd = {
    content: [
        {
            alignment: 'justify',
            columns: [
                {
                    text: 'Menus.'
                },
                {
                    alignment: 'right',
                    fontSize: 14,
                    stack: [
                        {
                            text: 'Paloma Cafe',
                            bold: true,
                        },
                        '8265 Howe Shore Suite 000',
                        '(603)095-0155',
                        '(603)095-0155',
                        'camron.mraz@yahoo.com',
                    ]
                }
            ]
        },
        {
            margin: [0, 27, 0, 0],
            text: 'Financial Statemant',
            fontSize: 32,
            bold: true,
        },
        {
            margin: [0, 4, 0, 0],
            text: '03/25/2017 - 03/31/2017',
            fontSize: 18,
            bold: true,
        },
        {
            margin: [0, 24, 0, 24],
            table: {
                headerRows: 1,
                widths: ['*', '*'],
                body: [
                    [
                        { text: 'Number of Orders' }, 
                        { text: '2350', bold: true, alignment: 'right' }
                    ],
                    [
                        { text: 'Number of Orders' }, 
                        { text: '2350', bold: true, alignment: 'right' }
                    ],
                    [
                        { text: 'Number of Orders' }, 
                        { text: '2350', bold: true, alignment: 'right' }
                    ],
                ]
            },
            layout: {
                defaultBorder: false,
            }
        },
        {
            margin: [0, 24, 0, 24],
            table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],
                body: [
                    [
                        { text: 'Order Number', style: 'ordersTableHeader' }, 
                        { text: 'Date', style: 'ordersTableHeader' },
                        { text: 'Payment Method', style: 'ordersTableHeader' },
                        { text: 'Tax Final', style: 'ordersTableHeader' },
                        { text: 'Delivery Charge', style: 'ordersTableHeader' },
                    ],
                    [
                        { text: '52E61076-2016-76', style: 'ordersTableRow' }, 
                        { text: '03.31.2017', style: 'ordersTableRow' },
                        { text: 'Cash', style: 'ordersTableRow' },
                        { text: '$3.50', style: 'ordersTableRow' },
                        { text: '$10.50', style: 'ordersTableRow' },
                    ],
                    [
                        { text: '52E61076-2016-76', style: 'ordersTableRow' }, 
                        { text: '03.31.2017', style: 'ordersTableRow' },
                        { text: 'Cash', style: 'ordersTableRow' },
                        { text: '$3.50', style: 'ordersTableRow' },
                        { text: '$10.50', style: 'ordersTableRow' },
                    ],
                    [
                        { text: '52E61076-2016-76', style: 'ordersTableRow' }, 
                        { text: '03.31.2017', style: 'ordersTableRow' },
                        { text: 'Cash', style: 'ordersTableRow' },
                        { text: '$3.50', style: 'ordersTableRow' },
                        { text: '$10.50', style: 'ordersTableRow' },
                    ],
                    [
                        { text: '52E61076-2016-76', style: 'ordersTableRow' }, 
                        { text: '03.31.2017', style: 'ordersTableRow' },
                        { text: 'Cash', style: 'ordersTableRow' },
                        { text: '$3.50', style: 'ordersTableRow' },
                        { text: '$10.50', style: 'ordersTableRow' },
                    ],
                    [
                        { text: '52E61076-2016-76', style: 'ordersTableRow' }, 
                        { text: '03.31.2017', style: 'ordersTableRow' },
                        { text: 'Cash', style: 'ordersTableRow' },
                        { text: '$3.50', style: 'ordersTableRow' },
                        { text: '$10.50', style: 'ordersTableRow' },
                    ],
                    [
                        { text: '52E61076-2016-76', style: 'ordersTableRow' }, 
                        { text: '03.31.2017', style: 'ordersTableRow' },
                        { text: 'Cash', style: 'ordersTableRow' },
                        { text: '$3.50', style: 'ordersTableRow' },
                        { text: '$10.50', style: 'ordersTableRow' },
                    ]
                ]
            },
            layout: {
                hLineWidth: function (i, node) {
                    if(i == 0) return i;
                    
                    return (i === 1 || i === node.table.body.length) ? 2 : 1;
                },
                vLineWidth: function (i, node) {
                    return 0;
                },
                hLineColor: function (i, node) {
                    return (i === 1 || i === node.table.body.length) ? 'black' : 'gray';
                },
                vLineColor: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                }
            }
        },
        {
            alignment: 'center',
            margin: [0, 18, 0, 0],
            text: 'If you need to reach Menus please feel free to call our customer service team at: ',
        },
        {
            alignment: 'center',
            text: '696-464-3400',
            bold: true,
        }
        
    ], styles: {
        header: {
            fontSize: 18,
            bold: true
        },
        bigger: {
            fontSize: 15,
            italics: true,
        },
        ordersTableHeader: {
            bold: true,
            fontSize: 12,
            margin: [0, 14, 0, 14]
        },
        ordersTableRow: {
            margin: [0, 14, 0, 14]
        }
    },
    defaultStyle: {
        columnGap: 20,
    }
}