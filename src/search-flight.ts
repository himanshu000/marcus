import { Culture, recognizeDateTime } from '@microsoft/recognizers-text-suite';
import { ActivityTypes, CardFactory, MessageFactory } from 'botbuilder';

// The accessor names for the conversation flow and user profile state property accessors.
const CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';
const USER_SEARCH_PROPERTY = 'userSearchProperty';

// Identifies the last question asked.
const question = {
    date: 'Date',
    destinationCity: 'Destination City',
    none: 'none',
    originCity: 'Origin City',
};

export class SearchFlightBot {
    private static async fillUserSearch(flow, search, conversationData, turnContext) {
        const input = turnContext.activity.text;
        const city = ['DLI', 'CNI', 'LKO', 'BOM'];
        const cityMap: Map<string, string> = new Map<string, string>([['DLI', 'DELHI'], ['CNI', 'CHENNAI'], ['LKO', 'LUCKNOW'], ['BOM', 'MUMBAI']]);
        switch (flow.lastQuestionAsked) {
            case question.none:
                await turnContext.sendActivity(MessageFactory.suggestedActions(city, 'Please enter origin city'));
                flow.lastQuestionAsked = question.originCity;
                break;

            case question.originCity:
                search.originCity = input;
                await turnContext.sendActivity(`You have selected origin city: ${search.originCity}.`);
                city.splice(city.indexOf(search.originCity), 1);
                await turnContext.sendActivity(MessageFactory.suggestedActions(city, 'Please enter destination city'));
                flow.lastQuestionAsked = question.destinationCity;
                break;

            case question.destinationCity:
                search.destinationCity = input;
                await turnContext.sendActivity(`You have selected destination city: ${search.destinationCity}.`);
                await turnContext.sendActivity('Please enter date');
                flow.lastQuestionAsked = question.date;
                break;

            case question.date:
                const result = this.validateDate(input);
                if (result.success) {
                    search.date = result.date;
                    flightStatusCard.body[0].columns[0].items[0].text = search.date;
                    flightStatusCard.body[1].columns[0].items[0].text = cityMap.get(search.originCity);
                    flightStatusCard.body[1].columns[0].items[1].text = search.originCity;
                    flightStatusCard.body[1].columns[1].items[0].text = cityMap.get(search.destinationCity);
                    flightStatusCard.body[1].columns[1].items[1].text = search.destinationCity;

                    await turnContext.sendActivity({
                        attachments: [CardFactory.adaptiveCard(flightStatusCard)],
                    });
                    conversationData.searchFlight = false;
                    flow.lastQuestionAsked = question.none;
                    search = {};
                    break;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    await turnContext.sendActivity(
                        result.message || 'I\'m sorry, I didn\'t understand that.',
                    );
                    break;
                }
        }
    }

    // Validates date input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    private static validateDate(input) {
        // Try to recognize the input as a date-time. This works for responses such as "11/14/2018", "today at 9pm", "tomorrow", "Sunday at 5pm", and so on.
        // The recognizer returns a list of potential recognition results, if any.
        try {
            const results = recognizeDateTime(
                input,
                Culture.English,
            );
            const now = new Date();
            const earliest = now.getTime() + 60 * 60 * 1000;
            let output;
            results.forEach((result) => {
                result.resolution.values.forEach((resolution) => {
                    const dateValue = resolution.value || resolution.start;
                    const dateTime = resolution.type === 'time' ? new Date(`${now.toLocaleDateString()} ${dateValue}`) : new Date(dateValue);
                    if (dateTime && earliest < dateTime.getTime()) {
                        output = {
                            date: dateTime.toLocaleDateString(),
                            success: true,
                        };
                    }
                });
            });
            return (
                output || {
                    message: 'I\'m sorry, please enter a date at least an hour out.',
                    success: false,
                }
            );
        } catch (error) {
            return {
                message: 'I\'m sorry, I could not interpret that as an appropriate date. Please enter a date at least an hour out.',
                success: false,
            };
        }
    }

    private conversationFlow: any;
    private userSearch: any;
    private conversationState: any;
    private userState: any;

    constructor(conversationState, userState) {
        this.conversationFlow = conversationState.createProperty(CONVERSATION_FLOW_PROPERTY);
        this.userSearch = userState.createProperty(USER_SEARCH_PROPERTY);

        // The state management objects for the conversation and user.
        this.conversationState = conversationState;
        this.userState = userState;
    }

    // The bot's turn handler.
    public async onTurn(turnContext, conversationData) {
        // This bot listens for message activities.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Get the state properties from the turn context.
            const flow = await this.conversationFlow.get(turnContext, {
                lastQuestionAsked: question.none,
            });
            const search = await this.userSearch.get(turnContext, {});

            await SearchFlightBot.fillUserSearch(flow, search, conversationData, turnContext);

            // Update state and save changes.
            await this.conversationFlow.set(turnContext, flow);
            await this.conversationState.saveChanges(turnContext);

            await this.userSearch.set(turnContext, search);
            await this.userState.saveChanges(turnContext);
        }
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
                            text: 'date',
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
                            text: 'value',
                            type: 'TextBlock',
                        },
                        {
                            color: 'Accent',
                            size: 'ExtraLarge',
                            spacing: 'None',
                            text: 'key',
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
                            text: 'value',
                            type: 'TextBlock',
                        },
                        {
                            color: 'Accent',
                            horizontalAlignment: 'Right',
                            size: 'ExtraLarge',
                            spacing: 'None',
                            text: 'key',
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
                            text: 'Flight',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                        {
                            spacing: 'Small',
                            text: 'KL0609',
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
                            text: '10:10 PM',
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
                            text: '12:00 PM',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
            ],
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
                            text: 'KL0601',
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
                            text: '1:00 AM',
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
                            text: '3:00 AM',
                            type: 'TextBlock',
                            weight: 'Bolder',
                        },
                    ],
                    type: 'Column',
                    width: 1,
                },
            ],
            spacing: 'Medium',
            type: 'ColumnSet',
        },
    ],
    type: 'AdaptiveCard',
    version: '1.0',
};
