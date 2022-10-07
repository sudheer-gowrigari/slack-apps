import * as dotenv from 'dotenv'
import SlackBolt from '@slack/bolt';
dotenv.config();

// Initializes your app with your bot token and signing secret
const slackApp = new SlackBolt.App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  endpoints: { events: '/slack/events', commands: '/slack/commands' }, // explicitly enable commands  
  port: process.env.PORT || 3000
});

slackApp.message(async ({ message, say }) => {
  // Filter out message events with subtypes (see https://api.slack.com/events/message)
  if (message.subtype === undefined || message.subtype === 'bot_message') {
    //const reversedText = [...message.text].reverse().join("");
    await say(message.text);
  }
});
// Listens to incoming messages that contain ""
slackApp.message('', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    console.log(" message user ", message)
    await say(`Hey there <@${message.user}>!`);
    //const channelId = "C12345";

    try {
    // Call the chat.postMessage method using the WebClient
    const result = await slackApp.client.chat.postMessage({
        channel: message.user,
        text: "Hello world "
    });

    console.log(result);
    }
    catch (error) {
    console.error(error);
    }
});

(async () => {
  // Start your app
  await slackApp.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();

(async () => {
    const result = await slackApp.client.users.list({
        token: process.env.SLACK_BOT_TOKEN,
    });
    //console.log("result slack users ", result);
})();

async function findConversation(name) {
  try {
    let conversationId = ''
    // Call the conversations.list method using the built-in WebClient
    const result = await slackApp.client.conversations.list({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      types: 'private_channel'
    });
    console.log(" channels list ", result.channels)
    for (const channel of result.channels) {
      if (channel.name === name) {
        conversationId = channel.id;

        // Print result
        console.log("Found conversation ID: " + conversationId);
        // Break from for loop
        break;
      }
    }
    return conversationId;
  }
  catch (error) {
    console.error(error);
  }
}

// Find conversation with a specified channel `name`
const conversationId = await findConversation("figma-designs-lwr-sites");

// Post a message to a channel your app is in using ID and message text
async function publishMessage(id, text) {
  try {
    // Call the chat.postMessage method using the built-in WebClient
    console.log("channel id " , id)
    const result = await slackApp.client.chat.postMessage({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
      
      text: text
      // You could also use a blocks[] array to send richer content
    });

    // Print result, which includes information about the message (like TS)
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
}

publishMessage(conversationId, "Hello world replying :tada:");

export {slackApp};


