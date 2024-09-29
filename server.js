/*
 * Load environment variables from .env file
 */
require('dotenv').config();

/*
 * Import the Express framework for building web applications
 */
const express = require('express');

/*
 * Import the path module to handle and transform file paths
 */
const path = require('path');

/*
 * Import functions for monitoring and retrieving room info from the VRChat controller
 */
const { startMonitoring, getRoomInfo } = require('./controllers/vrchatController');

/*
 * Import the function to connect to the Twitch service
 */
const { connectTwitch } = require('./services/twitchService');

/*
 * Create an instance of the Express application
 */
const app = express();

/*
 * Define the port on which the server will listen
 */
const port = 3000;

/*
 * Set the view engine to EJS (Embedded JavaScript Templates)
 */
app.set('view engine', 'ejs');

/*
 * Set the directory where the view templates are located
 */
app.set('views', path.join(__dirname, 'views'));

/*
 * Serve static files from the 'public' directory
 */
app.use(express.static('public'));

/*
 * Define a route for the root URL ('/') to render the index view
 */
app.get('/', (req, res) => {
    /*
     * Retrieve room information using the getRoomInfo function
     */
    const roomInfo = getRoomInfo();

    /*
     * Render the 'index' view and pass the room information to it
     */
    res.render('index', roomInfo);
});

/*
 * Define a route for the '/api/room-info' endpoint to provide room information as JSON
 */
app.get('/api/room-info', (req, res) => {
    /*
     * Send the room information as a JSON response
     */
    res.json(getRoomInfo());
});

/*
 * Start monitoring VRChat activity
 */
startMonitoring();

/*
 * Establish a connection to the Twitch service
 */
connectTwitch();

/*
 * Start the Express server and listen for incoming requests on the defined port
 */
app.listen(port, () => {
    /*
     * Log a message indicating that the server is running and the URL to access it
     */
    console.log(`Server is running on http://localhost:${port}`);
});
