import { ActionTypes, ActivityTypes, CardFactory, TurnContext } from 'botbuilder';

export class AboutMarcusBot {
    public async onTurn(turnContext: TurnContext) {
        // build buttons to display.
        const buttons = [
            {
                title: '1. Who I am?',
                type: ActionTypes.PostBack,
                value: 'Who I am?',
            },
            {
                title: '2. Go to Web app?',
                type: ActionTypes.OpenUrl,
                value: 'https://superfly.com',
            },
        ];

        // construct hero card.
        const card = CardFactory.heroCard(
            'Marcus',
            undefined,
            buttons,
        );

        // add card to Activity.
        const reply = {
            attachments: [card],
            type: ActivityTypes.Message,
        };

        // Send hero card to the user.
        await turnContext.sendActivity(reply);
    }
}
