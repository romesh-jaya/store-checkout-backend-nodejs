const logger = require('node-color-log');

// Create a basic logger
export const logInfo = (message) => {
  logger.color('green').log(message);
};

export const logError = (message) => {
  logger.color('red').log(message);
};
