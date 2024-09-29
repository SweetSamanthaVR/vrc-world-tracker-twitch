# VRChat Twitch Integration

This project integrates VRChat with Twitch, allowing users to monitor and retrieve VRChat world information through a Twitch chat command. It uses Node.js and Express as the web server framework.

## Features

- Monitors VRChat activity by reading log files.
- Provides room information via a web interface and a Twitch chat command.
- Sends updates to Twitch chat when specific commands are triggered.

## Requirements

- Node.js (version 14 or higher)
- npm (Node package manager)
- A Twitch account with OAuth token

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/SweetSamanthaVR/vrc-world-tracker-twitch.git
cd vrc-world-tracker-twitch
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a .env file in the root directory and add your Twitch credentials:**
```makefile
TWITCH_USERNAME=your_twitch_username
TWITCH_OAUTH_TOKEN=your_oauth_token
TWITCH_CHANNEL=your_twitch_channel
```

## Running the Application

To start the server, run:
```bash
npm start
```
The server will start on http://localhost:3000. You can access the web interface by visiting this URL in your browser.

## Twitch Command

In your Twitch chat, you can use the following command to get the current VRChat world information:
```bash
!world
```

## Monitoring Logs

The application will automatically monitor VRChat logs for updates, extracting world information whenever you enter a new world in VRChat.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

This project utilizes the following libraries and platforms:

### Frameworks and Libraries
- **[Express](https://expressjs.com/)**: Fast, unopinionated, minimalist web framework for Node.js.
- **[tmi.js](https://tmijs.com/)**: A library for interacting with Twitch chat.

### Platforms
- **[VRChat](https://vrchat.com/)**: Social VR platform.
