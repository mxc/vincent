/**
 * Created by mark on 2016/02/29.
 */

import Provider from './../../Provider';
import logger from './../../Logger';

class RemoteAccess {

    constructor(remoteUser, authentication, sudoAuthentication) {
        this.errors = [];
        if (!remoteUser) {
            //same means login as user executing vincent
            this.remoteUser = "same";
        } else if (typeof remoteUser !== 'string') {
            logger.logAndAddToErrors("Remote user must be a user name.", this.errors);
        } else {
            this.remoteUser = remoteUser
        }

        if (!authentication) {
            this.authentication = "publicKey";
        } else if (authentication != "publicKey" && authentication != "password") {
            logger.logAndAddToErrors("Authentication must be either 'password' or 'publicKey'.",
                this.errors);
        } else {
            this.authentication = authentication;
        }

        if (!sudoAuthentication) {
            this.sudoAuthentication = false;
        } else if (typeof sudoAuthentication !== 'boolean') {
            logger.logAndAddToErrors("sudoAuthentication must be a boolean value.", this.errors);
        } else {
            this.sudoAuthentication = sudoAuthentication;
        }
        if (this.errors.length>0){
            let string = this.errors.join("\n\r");
            throw new Error("Invalid configuration settings provided for RemoteAccess object.\n\r" +
                string);
        }
    }
}
export default RemoteAccess;