import { ActivityTypes, TurnContext } from 'botbuilder';
import { AboutMarcusBot } from './about-marcus';
import { FlightStatusBot } from './flight-status';
import { HelpBot } from './help';
import { SearchFlightBot } from './search-flight';

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class MyBot {
    private aboutMarcusBot = new AboutMarcusBot();
    private flightStatusBot = new FlightStatusBot();
    private helpBot = new HelpBot();
    private searchFlightBot;
    private conversationData;
    private userProfile;
    private conversationState;
    private userState;

    constructor(conversationState, userState) {
        // Create the state property accessors for the conversation data and user profile.
        this.conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        this.conversationState = conversationState;
        this.userState = userState;

        this.searchFlightBot = new SearchFlightBot(conversationState, userState);
    }

    /**
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} context on turn context object.
     */
    public async onTurn(turnContext: TurnContext) {
        switch (turnContext.activity.type) {
            case ActivityTypes.Message:
                // Get the state properties from the turn context.
                const userProfile = await this.userProfile.get(turnContext, {});
                const conversationData = await this.conversationData.get(
                    turnContext,
                    { promptedForUserName: false, searchFlight: false },
                );
                if (!userProfile.name) {
                    // First time around this is undefined, so we will prompt user for name.
                    if (conversationData.promptedForUserName) {
                        // Set the name to what the user provided.
                        userProfile.name = turnContext.activity.text;

                        // Acknowledge that we got their name.
                        await turnContext.sendActivity(`Thanks ${ userProfile.name }.`);

                        // Reset the flag to allow the bot to go though the cycle again.
                        conversationData.promptedForUserName = false;
                    } else {
                        // Prompt the user for their name.
                        await turnContext.sendActivity('What is your name?');

                        // Set the flag to true, so we don't prompt in the next turn.
                        conversationData.promptedForUserName = true;
                    }
                    // Save user state and save changes.
                    await this.userProfile.set(turnContext, userProfile);
                    await this.userState.saveChanges(turnContext);
                } else {
                    // Add message details to the conversation data.
                    conversationData.timestamp = turnContext.activity.timestamp.toLocaleString();
                    conversationData.channelId = turnContext.activity.channelId;

                    const text = turnContext.activity.text.toLowerCase();
                    if (conversationData.searchFlight) {
                        await this.searchFlightBot.onTurn(turnContext, conversationData);
                    } else {
                        switch (text) {
                            case 'hi':
                            case 'hello':
                            case 'hey':
                                await turnContext.sendActivity(`Hello ${ userProfile.name }, How may I help you.`);
                                break;
                            case 'who are you':
                                await this.aboutMarcusBot.onTurn(turnContext);
                                break;
                            case 'who i am?':
                                await turnContext.sendActivity('I am Marcus and I am your superfly assistance provider');
                                break;
                            case 'show flight status':
                            case 'flight status':
                                await this.flightStatusBot.onTurn(turnContext);
                                break;
                            case 'search flight':
                                conversationData.searchFlight = true;
                                await this.searchFlightBot.onTurn(turnContext, conversationData);
                                break;
                            case 'help':
                                await this.helpBot.onTurn(turnContext);
                                break;
                            default:
                                await turnContext.sendActivity(`Sorry ${ userProfile.name }. I couldn't understand you.
                                I am still under development. Please try later.`);
                                break;
                        }
                    }

                    // // Display state data.
                    // await turnContext.sendActivity(
                    //     `${ userProfile.name } sent: ${ turnContext.activity.text }`,
                    // );
                    // await turnContext.sendActivity(
                    //     `Message received at: ${ conversationData.timestamp }`,
                    // );
                    // await turnContext.sendActivity(
                    //     `Message received from: ${ conversationData.channelId }`,
                    // );
                }
                // Update conversation state and save changes.
                await this.conversationData.set(turnContext, conversationData);
                await this.conversationState.saveChanges(turnContext);
                break;
            case ActivityTypes.ConversationUpdate:
                await this.sendWelcomeMessage(turnContext);
                break;
            default:
                await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
                break;
        }
    }

    // Sends welcome messages to conversation members when they join the conversation.
    // Messages are only sent to conversation members who aren't the bot.
    private async sendWelcomeMessage(turnContext: TurnContext) {
        // If any new membmers added to the conversation
        if (turnContext.activity.membersAdded) {
            const replyPromises = turnContext.activity.membersAdded.map(async (member) => {
                if (member.id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivity(`Welcome to Super Fly.`);
                }
            });
            await Promise.all(replyPromises);
        }
    }
}
