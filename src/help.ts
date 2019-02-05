import { MessageFactory, TurnContext } from 'botbuilder';

export class HelpBot {
    public async onTurn(turnContext: TurnContext) {
        const reply = MessageFactory.suggestedActions(['Search Flight', 'Book Flight', 'Flight Status', 'Show Weather'],
        'Please select one of the options');
        await turnContext.sendActivity(reply);
    }
}
