const fs = require('fs');

const logToConsole = (message) => {
    console.log(message);
};

const logToFile = (message, filePath) => {
    fs.appendFile(filePath, message + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file', err);
        }
    });
};

const info = (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()}: ${message}`;
    logToConsole(logMessage);
    logToFile(logMessage, 'application.log');
};

const error = (message) => {
    const logMessage = `[ERROR] ${new Date().toISOString()}: ${message}`;
    logToConsole(logMessage);
    logToFile(logMessage, 'application.log');
};

const warn = (message) => {
    const logMessage = `[WARN] ${new Date().toISOString()}: ${message}`;
    logToConsole(logMessage);
    logToFile(logMessage, 'application.log');
};

module.exports = {
    info,
    error,
    warn,
};