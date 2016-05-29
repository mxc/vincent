/**
 * Created by mark on 2016/02/29.
 */


import logger from './../../Logger';
import Base from './../base/Base';

class RemoteAccess extends Base {

    constructor(remoteUser, authentication, sudoAuthentication) {
        super();
        this.errors = [];
        this.data={};
        if (!remoteUser) {
            //same means login as user executing vincent
            this.data.remoteUser = "same";
        } else if (typeof remoteUser !== 'string') {
            logger.logAndAddToErrors("Remote user must be a user name.", this.errors);
        } else {
            this.data.remoteUser = remoteUser
        }

        if (!authentication) {
            this.data.authentication = "publicKey";
        } else if (authentication != "publicKey" && authentication != "password") {
            logger.logAndAddToErrors("Authentication must be either 'password' or 'publicKey'.",
                this.errors);
        } else {
            this.data.authentication = authentication;
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
            this.data.sudoAuthentication = sudoAuthentication;
        }
        if (this.errors.length>0){
            let str = `Invalid configuration settings provided for RemoteAccess object./n/r${this.errors.join("/n/r")}`;
            throw new Error(str);
        }
    }

    get remoteUser(){
        return this.data.remoteUser;
    }

    get sudoAuthentication(){
        return this.data.sudoAuthentication;
    }

    get authentication(){
        return this.data.authentication;
    }

    export(){
        if (this.data.remoteUser=='same'){
            return {};
        }else {
            return this.data;
        }
    }
}
export default RemoteAccess;