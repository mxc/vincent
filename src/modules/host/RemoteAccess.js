/**
 * Created by mark on 2016/02/29.
 */


import logger from './../../Logger';
import Base from './../base/Base';
import User from './../user/User';

class RemoteAccess extends Base {

    constructor(remoteUser, authentication, sudoAuthentication) {
        super();
        this.errors = [];
        this.data = {};

        try {
            this.remoteUser = remoteUser;
        } catch (e) {
            this.errors.push(e);
        }

        try {
            this.authentication = authentication;
        } catch (e) {
            this.errors.push(e);
        }

        try {
            this.sudoAuthentication = sudoAuthentication;
        } catch (e) {
            this.errors.push(e);
        }

        if (this.errors.length > 0) {
            let str = `Invalid configuration settings provided for RemoteAccess object./n/r${this.errors.join("/n/r")}`;
            throw new Error(str);
        }
    }

    get remoteUser() {
        return this.data.remoteUser;
    }

    get sudoAuthentication() {
        return this.data.sudoAuthentication;
    }

    get authentication() {
        return this.data.authentication;
    }

    set remoteUser(remoteUser) {
        if (!remoteUser) {
            //same means login as user executing vincent
            this.data.remoteUser = "same";
        } else if (typeof remoteUser == 'string') {
            this.data.remoteUser = remoteUser
        } else if (remoteUser instanceof User) {
            this.data.remoteUser = remoteUser.name;
        } else {
            logger.logAndThrow("Remote user must be a user name.");
        }
    }


    set authentication(authentication) {
        if (!authentication) {
            this.data.authentication = "publicKey";
        } else if (authentication != "publicKey" && authentication != "password") {
            logger.logAndThrow("Authentication must be either 'password' or 'publicKey'.");
        } else {
            this.data.authentication = authentication;
        }
    }

    set sudoAuthentication(sudoAuthentication) {
        if (!sudoAuthentication) {
            sudoAuthentication = false;
        } else if (typeof sudoAuthentication === 'string') {
            try {
                sudoAuthentication = this.getBooleanValue(sudoAuthentication);
            } catch (e) {
                logger.logAndThrow(`sudoAuthentication must be a boolean value. Current value is ${sudoAuthentication} - ${e.message}.`);
            }
        } else {
            this.data.sudoAuthentication = sudoAuthentication;
        }
    }

    export() {
        if (this.data.remoteUser == 'same') {
            return {};
        } else {
            return this.data;
        }
    }
}
export default RemoteAccess;