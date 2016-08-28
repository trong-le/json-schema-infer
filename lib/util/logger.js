import bunyan from 'bunyan';

const logDir = process.env.NODE_LOG_DIR !== undefined
    ? process.env.NODE_LOG_DIR
    : ".";

const options = {
    name: 'json-schema-infer',
    streams: [{
        level: 'trace',
        path: `${logDir}/app.log`                
    }]
};

export default bunyan.createLogger(options);

