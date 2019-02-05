import { CardFactory, TurnContext } from 'botbuilder';

export class FlightStatusBot {
    public async onTurn(turnContext: TurnContext) {
        await turnContext.sendActivity({
            attachments: [CardFactory.adaptiveCard(flightStatusCard)],
        });
    }
}

const flightStatusCard = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    body: [
        {
            columns: [
                {
                    items: [
                        {
                            horizontalAlignment: 'Right',
                            isSubtle: true,
                            text: 'Flight Status',
                            type: 'TextBlock',
                        },
                        {
                            color: 'Attention',
                            horizontalAlignment: 'Right',
                            size: 'Large',
                            spacing: 'None',
                            text: 'On Time',
                            type: 'TextBlock',
                        },
                    ],
                    type: 'Column',
                    width: 'stretch',
                },
            ],
            type: 'ColumnSet',
        },
        {
            columns: [
                {
                    items: [
                        {
                            isSubtle: true,
                            text: 'Passengers',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                        {
                            spacing: 'Small',
                            text: 'Sarah Hum',
                            type: 'TextBlock',
                        },
                        {
                            spacing: 'Small',
                            text: 'Jeremy Goldberg',
                            type: 'TextBlock',
                        },
                    ],
                    type: 'Column',
                    width: 'stretch',
                },
                {
                    items: [
                        {
                            horizontalAlignment: 'Right',
                            isSubtle: true,
                            text: 'Seat',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                        {
                            horizontalAlignment: 'Right',
                            spacing: 'Small',
                            text: '14A',
                            type: 'TextBlock',
                        },
                        {
                            horizontalAlignment: 'Right',
                            spacing: 'Small',
                            text: '14B',
                            type: 'TextBlock',
                        },
                    ],
                    type: 'Column',
                    width: 'auto',
                },
            ],
            separator: true,
            spacing: 'Medium',
            type: 'ColumnSet',
        },
        {
            columns: [
                {
                    items: [
                        {
                            isSubtle: true,
                            text: 'Flight',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                        {
                            spacing: 'Small',
                            text: 'KL0605',
                            type: 'TextBlock',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
                {
                    items: [
                        {
                            horizontalAlignment: 'Center',
                            isSubtle: true,
                            text: 'Departs',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                        {
                            color: 'Attention',
                            horizontalAlignment: 'Center',
                            spacing: 'Small',
                            text: '10:10 AM',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
                {
                    items: [
                        {
                            horizontalAlignment: 'Right',
                            isSubtle: true,
                            text: 'Arrives',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                        {
                            color: 'Attention',
                            horizontalAlignment: 'Right',
                            spacing: 'Small',
                            text: '12:00 AM',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
            ],
            separator: true,
            spacing: 'Medium',
            type: 'ColumnSet',
        },
        {
            columns: [
                {
                    items: [
                        {
                            isSubtle: true,
                            text: 'Amsterdam',
                            type: 'TextBlock',
                        },
                        {
                            color: 'Accent',
                            size: 'ExtraLarge',
                            spacing: 'None',
                            text: 'AMS',
                            type: 'TextBlock',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
                {
                    items: [
                        {
                            horizontalAlignment: 'Right',
                            isSubtle: true,
                            text: 'San Francisco',
                            type: 'TextBlock',
                        },
                        {
                            color: 'Accent',
                            horizontalAlignment: 'Right',
                            size: 'ExtraLarge',
                            spacing: 'None',
                            text: 'SFO',
                            type: 'TextBlock',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
            ],
            separator: true,
            spacing: 'Medium',
            type: 'ColumnSet',
        },
    ],
    speak: '<s>Flight KL0605 to San Fransisco will leave at 10:10 AM.</s>',
    type: 'AdaptiveCard',
    version: '1.0',
};
