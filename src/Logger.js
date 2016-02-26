/**
 * Created by mark on 2016/02/13.
 */
import {createLogger}  from 'bunyan';

class Logger {
    constructor() {
        this.logger = createLogger({name: "coach", streams: [{path: "vincent.log"}]});
    }

    info(msg) {
        this.logger.info(msg);
    }

    warn(msg) {
        this.logger.warn(msg);
    }

    error(msg) {
        this.logger.error(msg);
    }

    logAndThrow(msg) {
        this.error(msg);
        throw new Error(msg);
    }

    logAndAddToErrors(msg, errors) {
        this.error(msg);
        errors.push(msg);
    }
}

var logger = new Logger();

export default logger;