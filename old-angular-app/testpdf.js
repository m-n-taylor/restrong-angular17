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
            margin: [0, 24, 0, 24],
            fontSize: 30,
            bold: true,
            alignment: 'center',
            table: {
                widths: ['*'],
                body: [
                    ['Deliver by 03.31.2017 2:30 PM'],
                ]
            }
        },
        {
            columns: [
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [{
                                margin: [16, 9, 16, 9],
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
                            }],
                        ]
                    }
                },
                {
                    margin: [16, 9, 16, 9],
                    stack: [
                        {
                            text: 'Instructions:',
                            bold: true,
                        },
                        {
                            margin: [0, 4, 50, 0],
                            text: 'This is the Hilton Union Square Hotel, Tower 1 Rm 722. Please bring paper and utensils.',
                        },
                    ]
                }
            ]
        },
        {
            margin: [0, 24, 0, 24],
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto'],
                body: [
                    [{ text: 'Qty', style: 'itemsTableHeader' }, { text: 'Item', style: 'itemsTableHeader' }, { text: 'Price', style: 'itemsTableHeader', alignment: 'right' }],
                    [{ text: '1x', style: 'itemsTableRow' }, { text: 'Cheap Burger', style: 'itemsTableRow' }, { text: '$10.25', style: 'itemsTableRow', alignment: 'right' }],
                    [{ text: '2x', style: 'itemsTableRow' }, {
                        style: 'itemsTableRow',
                        stack: [
                            {
                                text: 'Caprese Bite ( Small 12”):',
                            },
                            {
                                table: {
                                    widths: ['*', '*'],
                                    body: [
                                        [{ text: 'Choice of Dressing',  margin: [0, 9, 0, 0], bold: true }, { text: 'Balsamic Vinegar & Oil',  margin: [0, 9, 0, 0] },],
                                        [{ text: 'Extra',  margin: [0, 4, 0, 0], bold: true }, { text: 'Chicken ($0.75), Fresh Mozzarella ($0.75), Three Prawns ($3.95) Sweat Sausages ($2.95)',  margin: [0, 4, 0, 0] }],
                                        [{ text: 'Items',  margin: [0, 4, 0, 0], bold: true }, { text: 'Balsamic Vinegar & Oil ',  margin: [0, 4, 0, 0] }],
                                    ],
                                },
                                layout: {
                                    defaultBorder: false,
                                }
                            }
                        ]
                    }, { text: '$10.25', style: 'itemsTableRow', alignment: 'right' }],
                ]
            },
            layout: {
                hLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 2 : 1;
                },
                vLineWidth: function (i, node) {
                    return 0;
                },
                hLineColor: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                },
                vLineColor: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                },
                padding: function (i, node) { return 50; },
                // paddingRight: function(i, node) { return 4; },
                // paddingTop: function(i, node) { return 2; },
                // paddingBottom: function(i, node) { return 2; },
                // fillColor: function (i, node) { return null; }
            }
        },
        {
            alignment: 'justify',
            columns: [
                {
                    table: {
                        widths: ['auto'],
                        body: [
                            [{
                                margin: [12, 12, 12, 12],
                                stack: [
                                    'Will pay with',
                                    {
                                        fontSize: 18,
                                        text: 'CASH',
                                        bold: true,
                                    },
                                ]
                            }],
                        ]
                    }
                },
                {
                    alignment: 'right',
                    table: {
                        widths: ['*', '*'],
                        body: [
                            ['Subtotal:', '$10.25'],
                            ['Tax (6%):', '$10.25'],
                            ['Driver Tip (6%):', '$10.25'],
                            ['Driver Charge:', '$3.25'],
                            ['Service Fee:', '$1.25'],
                            [
                                {
                                    text: 'Total',
                                    fontSize: 18,
                                }, {
                                    text: '$45.64',
                                    fontSize: 18,
                                }
                            ],
                        ],
                    },
                    layout: {
                        defaultBorder: false,
                    }
                }
            ]
        },
        {
            margin: [0, 24, 0, 0],
            table: {
                widths: ['*', '*'],
                body: [
                    [
                        [
                            {
                                margin: [0, 18, 70, 0],
                                text: 'If you need to reach Menus please feel free to call our customer service team at: ',
                            },
                            {
                                text: '696-464-3400',
                                bold: true,
                            }
                        ],
                        [   
                            {
                                margin: [0, 18, 0, 0],
                                alignment: 'right',
                                text: 'Order Number', 
                                bold: true,
                            },
                            {
                                margin: [0, 0, 0, 18],
                                alignment: 'right',
                                fontSize: 36,
                                text: '937834545',
                                bold: true,
                            }
                        ]
                    ],
                ],
            },
            layout: {
                vLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 0 : 1;
                },
            }
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
        itemsTableHeader: {
            bold: true,
            margin: [0, 14, 0, 14]
        },
        itemsTableRow: {
            margin: [0, 14, 0, 14]
        }
    },
    defaultStyle: {
        columnGap: 20,
    }
}