/**
 * Created by mark on 2016/02/13.
 */
import {createLogger}  from 'bunyan';

class Logger {
    constructor() {
        this.logger = createLogger({name: "coach", level: "debug", streams: [{path: "vincent.log"}]});
    }

    fatal(msg) {
        this.logger.fatal(msg);
    }

    info(msg) {
        this.logger.info(msg);
    }

    warn(msg) {
        this.logger.warn(msg);
    }
    
    debug(msg){
        this.logger.debug(msg);
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

    logAndThrowSecruityPermission(appUser,host,action){
        let msg = this.securityWarning(appUser,host,action);
        throw new Error(msg);
    }

    securityWarning(appUser,host, action){
        let msg =`User ${appUser.name} does not have the required permissions for host ${host.name} for the action ${action}.`;
        this.warn(msg);
        return msg;
    }

}

var logger = new Logger();

export default logger;