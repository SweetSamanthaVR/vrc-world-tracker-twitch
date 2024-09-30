/*
 * Import the 'fs' module for interacting with the file system
 */
const fs = require('fs');

/*
 * Import the 'path' module for handling and transforming file paths
 */
const path = require('path');

/*
 * Initialize variables to hold the current VRChat world and its URL
 */
let currentVRChatWorld = null;
let currentWorldURL = null;

/*
 * Define the directory where VRChat logs are stored, using the LOCALAPPDATA environment variable
 */
const logDir = path.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'VRChat', 'VRChat');

/*
 * Function to retrieve the most recent log file from a given list of files and directory
 */
const getLatestLogFile = (files, logDir) => {
    /*
     * Filter the provided list of files to include only those that start with 'output_log_'
     * and are confirmed to be regular files (not directories)
     */
    const logFiles = files.filter(file =>
        file.startsWith('output_log_') &&
        fs.statSync(path.join(logDir, file)).isFile()
    );

    /*
     * Sort the filtered log files by their last modified time in descending order
     * so that the most recently modified file appears first
     */
    const sortedFiles = logFiles.sort((a, b) =>
        fs.statSync(path.join(logDir, b)).mtime - fs.statSync(path.join(logDir, a)).mtime
    );

    /*
     * Return the first file from the sorted array, which is the latest log file
     */
    return sortedFiles[0];
}

/*
 * Function to monitor a specified log file for changes and process new entries
 */
const monitorLogFile = (logFile, logDir, callback) => {
    /*
     * Get the initial size of the log file to track changes
     */
    let lastFileSize = fs.statSync(path.join(logDir, logFile)).size;

    /*
     * Watch the log file for changes, checking every 1000 milliseconds (1 second)
     */
    fs.watchFile(path.join(logDir, logFile), { interval: 1000 }, (curr) => {
        /*
         * If the current file size is greater than the last recorded size,
         * it indicates that new data has been added
         */
        if (curr.size > lastFileSize) {
            /*
             * Create a read stream starting from the last known position in the file
             */
            const stream = fs.createReadStream(path.join(logDir, logFile), { start: lastFileSize });
            stream.on('data', (chunk) => {
                /*
                 * Convert the chunk of data to a string and split it into lines
                 */
                const data = chunk.toString();
                const lines = data.split('\n');

                /*
                 * Process each line of the log file to extract relevant information
                 */
                lines.forEach(line => {
                    /*
                     * Use regular expressions to match lines containing world information
                     */
                    const worldInfoMatch = line.match(/\[Behaviour\] Fetching world information for (.+)/);
                    const roomMatch = line.match(/\[Behaviour\] Entering Room: (.+)/);

                    /*
                     * If a match for world information is found, update the current world URL
                     */
                    if (worldInfoMatch) {
                        currentWorldURL = `https://vrchat.com/home/world/${worldInfoMatch[1]}`;
                    }

                    /*
                     * If a match for entering a room is found, update the current VRChat world
                     * and log the information to the console
                     */
                    if (roomMatch) {
                        currentVRChatWorld = roomMatch[1];
                        console.log(`Entering VRChat World: ${currentVRChatWorld}`);
                        console.log(`World URL: ${currentWorldURL}`);
                    }

                    /*
                     * Call the provided callback function with the current world and URL
                     */
                    callback(currentVRChatWorld, currentWorldURL);
                });
            });

            /*
             * Update the last file size to the current size
             */
            lastFileSize = curr.size;
        }
    });
};

/*
 * This variable stores the last detected world name.
 * It is initialized as an empty string to indicate that no world has been detected yet.
 */

let lastWorldDetected = '';

/*
 * Function to start monitoring the latest log file in the specified log directory
 */
const startMonitoring = () => {
    /*
     * Read the contents of the log directory to retrieve the list of files
     */
    fs.readdir(logDir, (err, files) => {
        /*
         * If an error occurs while reading the directory, log the error and exit the function
         */
        if (err) {
            console.error('Error reading log directory:', err);
            return;
        }

        /*
         * Get the latest log file from the list of files in the log directory
         */
        const latestLogFile = getLatestLogFile(files, logDir);

        /*
         * If a latest log file is found, begin monitoring it
         */
        if (latestLogFile) {
            console.log(`Monitoring log file: ${latestLogFile}`);

            /*
             * Call the monitorLogFile function to monitor the latest log file
             * Pass an empty callback function for now (this can be defined later)
             */
            monitorLogFile(latestLogFile, logDir, (world, url) => {
                if (world && world !== lastWorldDetected) {
                    lastWorldDetected = world;
                }
            });
        } else {
            /*
             * Log a message if no log files are found in the directory
             */
            console.log('No log files found.');
        }
    });
};

/*
 * Function to get the current VRChat world information and its URL
 */
const getRoomInfo = () => ({
    /*
     * Return an object containing the current VRChat world and its associated URL
     */
    vrchatWorld: currentVRChatWorld,
    worldURL: currentWorldURL
});

/*
 * Export the getRoomInfo and startMonitoring functions for use in other modules
 */
module.exports = {
    /*
     * Function to retrieve the current VRChat world information
     */
    getRoomInfo,

    /*
     * Function to initiate monitoring of log files
     */
    startMonitoring
};
