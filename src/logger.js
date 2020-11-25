const pino = require('pino');

const logger = pino({
    name: 'pushgateway-cleaner',
    level: process.env.LOG_LEVEL || 'info'
});

module.exports = logger;