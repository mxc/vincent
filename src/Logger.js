/**
 * Created by mark on 2016/02/13.
 */
import Logger  from 'bunyan';


class VLogger {
    constructor() {

        this.logger = new Logger({name: "vincent", level: "debug", src: true, streams: [{path: "vincent.log"}]});
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
        if(typeof msg ==="string"){
            this.logger.error(msg);
        } else{
            this.logger.error(msg.message? e.message: JSON.stringify(e));
        }
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

    securityWarning(appUser,permObj, action){
        let msg =`User ${appUser.name} does not have the required permissions for ${permObj.name? permObj.name : permObj.constructor.name} for the action ${action}.`;
        this.warn(msg);
        return msg;
    }

    addStream(dest,level,type="file") {
        let def = {
            "type": type,
            level: level
        };
        if (type == "file") {
            def.path = dest;
        }else{
            def.stream=dest;    
        }
        this.logger.addStream(def);
    }

    setStream(dest,level,type="file"){
        this.logger.streams = [];
        this.addStream(dest,level,type);
    }

    getStreams(){
        return this.logger.streams;
    }

}

var logger = new VLogger();

export {logger,VLogger};