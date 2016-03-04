/**
 * Created by mark on 2016/02/29.
 */

import Provider from './../../Provider';
import logger from './../../Logger';
import Base from './../Base';

class RemoteAccess extends Base {

    constructor(remoteUser, authentication, sudoAuthentication) {
        super();
        this.errors = [];
        this._export={};
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
            sudoAuthentication = false;
        } else if(typeof sudoAuthentication ==='string'){
                try{
                    sudoAuthentication = this.getBooleanValue(sudoAuthentication);
                }catch(e){
                    this.errors.push(e);
                }
        }

        if (typeof sudoAuthentication !== 'boolean') {
            logger.logAndAddToErrors("sudoAuthentication must be a boolean value.", this.errors);
        } else {
            this.sudoAuthentication = sudoAuthentication;
        }
        this._export={
            remoteUser: this.remoteUser,
            authentication: this.authentication,
            sudoAuthentication: this.sudoAuthentication
        };
        if (this.errors.length>0){
            let str = `Invalid configuration settings provided for RemoteAccess object./n/r${this.errors.join("/n/r")}`;
            throw new Error(str);
        }
    }

    export(){
        return this._export;
    }
}
export default RemoteAccess;