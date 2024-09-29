/*
 * Import the tmi.js library for interacting with Twitch chat
 */
const tmi = require('tmi.js');

/*
 * Import the getRoomInfo function from the VRChat controller
 */
const { getRoomInfo } = require('../controllers/vrchatController');

/*
 * Function to sanitize user input by removing unwanted characters
 */
const sanitizeInput = (input) => {
    /*
     * Replace non-word characters (excluding whitespace and exclamation marks) with an empty string and trim the input
     */
    return input.replace(/[^\w\s!]/gi, '').trim();
};

/*
 * Retrieve the Twitch channel name from environment variables
 */
const twitchChannel = process.env.TWITCH_CHANNEL;

/*
 * Log a message indicating the attempt to join the specified Twitch channel
 */
console.log(`Attempting to join channel: ${twitchChannel}`);

/*
 * Create a new instance of the tmi.Client for connecting to Twitch
 */
const twitchClient = new tmi.Client({
    /*
     * Configuration options for the client
     */
    options: { debug: true },

    /*
     * Connection settings for the client
     */
    connection: {
        /*
         * Enable automatic reconnection to the Twitch server
         */
        reconnect: true,

        /*
         * Use a secure connection (HTTPS)
         */
        secure: true
    },

    /*
     * Identity settings for authenticating with Twitch
     */
    identity: {
        /*
         * Twitch username retrieved from environment variables
         */
        username: process.env.TWITCH_USERNAME,

        /*
         * OAuth token for authenticating the Twitch account, retrieved from environment variables
         */
        password: process.env.TWITCH_OAUTH_TOKEN
    },

    /*
     * Array of channels to join upon connecting
     */
    channels: [twitchChannel]
});

/*
 * Set up an event listener for incoming messages in the Twitch chat
 */
twitchClient.on('message', (channel, tags, message, self) => {
    /*
     * Ignore messages sent by the bot itself to prevent loops
     */
    if (self) return;

    /*
     * Sanitize and split the incoming message into arguments
     */
    const args = sanitizeInput(message.trim()).split(/\s+/);

    /*
     * Check if the command is '!world' (case insensitive)
     */
    if (args[0].toLowerCase() === '!world') {
        /*
         * Retrieve VRChat world information using the getRoomInfo function
         */
        const { vrchatWorld, worldURL } = getRoomInfo();

        /*
         * Log the VRChat world information to the console
         */
        console.log("VRChat World Info:", { vrchatWorld, worldURL });

        /*
         * Check if both vrchatWorld and worldURL are available
         */
        if (vrchatWorld && worldURL) {
            /*
             * Send a message to the Twitch channel with the VRChat world information
             */
            twitchClient.say(channel, `VRChat World: ${vrchatWorld}, World URL: ${worldURL}`);
        } else {
            /*
             * Notify the Twitch channel that the VRChat world information is not available
             */
            twitchClient.say(channel, `VRChat World or World URL information is not available at the moment.`);
        }
    }
});

/*
 * Function to connect to the Twitch client
 */
const connectTwitch = () => {
    /*
     * Attempt to connect to the Twitch chat and log any errors to the console
     */
    twitchClient.connect().catch(console.error);
};

/*
 * Export the connectTwitch function for use in other modules
 */
module.exports = {
    connectTwitch
};
