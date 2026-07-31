const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
console.log('config.env===>>', config.env, config.mongoose)
let db_url;
let port;
if (config.env == "production") {
    db_url = config.mongoose.url;
    port = config.port;
    config.mongoose.options = {
        user: config.mongoose.user,
        pass: config.mongoose.pass
    }
} else {
    db_url = config.mongoose.url;
    port = config.port;
}
console.log('check mongodb===', config.env)
mongoose.connect(db_url, config.mongoose.options).then(() => {
    logger.info(db_url, config.mongoose.options);
    server = app.listen(port, () => {
        logger.info(`Listening to port ${port}`);
    });
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});