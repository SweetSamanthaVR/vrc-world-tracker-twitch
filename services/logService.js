/*
 * Import the 'fs' module for interacting with the file system
 */
const fs = require('fs');

/*
 * Import the 'path' module for handling and transforming file paths
 */
const path = require('path');

/*
 * Function to get the latest log file from a specified directory
 */
const getLatestLogFile = (files, logDir) => {
    /*
     * Filter the list of files to include only those that start with 'output_log_'
     * and are actual files (not directories)
     */
    const logFiles = files.filter(file =>
        file.startsWith('output_log_') &&
        fs.statSync(path.join(logDir, file)).isFile()
    );

    /*
     * Sort the filtered log files by their last modified time in descending order
     */
    const sortedFiles = logFiles.sort((a, b) =>
        fs.statSync(path.join(logDir, b)).mtime - fs.statSync(path.join(logDir, a)).mtime
    );

    /*
     * Return the latest log file (the first in the sorted array)
     */
    return sortedFiles[0];
};

/*
 * Function to monitor a specific log file for changes
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
         * it means new data has been added
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
                 * Process each line of the log file
                 */
                lines.forEach(line => {
                    console.log("Processing line:", line);

                    /*
                     * Use regular expressions to match lines containing world information
                     */
                    const worldInfoMatch = line.match(/\[Behaviour\] Fetching world information for (.+)/);
                    const roomMatch = line.match(/\[Behaviour\] Entering Room: (.+)/);

                    /*
                     * If a match is found, extract the relevant information
                     */
                    if (worldInfoMatch || roomMatch) {
                        const world = roomMatch ? roomMatch[1] : null;
                        const url = worldInfoMatch ? `https://vrchat.com/home/world/${worldInfoMatch[1]}` : null;

                        /*
                         * Call the provided callback function with the extracted world and URL
                         */
                        callback(world, url);

                        /*
                         * Log the matches for debugging purposes
                         */
                        if (worldInfoMatch) {
                            console.log("World Info Match:", worldInfoMatch[1]);
                        }
                        if (roomMatch) {
                            console.log("Room Match:", roomMatch[1]);
                        }
                    }
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
 * Export the functions for use in other modules
 */
module.exports = {
    /*
     * Function to get the latest log file
     */
    getLatestLogFile,

    /*
     * Function to monitor a specific log file for changes
     */
    monitorLogFile
};
