/**
 * Created by mark on 2016/02/29.
 */


import {logger} from './../../Logger';
import Base from './../base/Base';
import User from './../user/User';

class RemoteAccess extends Base {

    constructor(remoteUser, authentication, becomeUser,sudoAuthentication) {
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
            this.becomeUser = becomeUser;
        } catch (e) {
            this.errors.push(e);
        }

        try{
            this.sudoAuthentication=sudoAuthentication;
        }catch(e){
            this.errors.push(e);
        }

        if (this.errors.length > 0) {
            let str = `Invalid configuration settings provided for RemoteAccess object./n/r${this.errors.join("/n/r")}`;
            throw new Error(str);
        }
    }

    get sudoAuthentication() {
        return this.data.sudoAuthentication? this.data.sudoAuthentication: false;
    }

    set sudoAuthentication(enable) {
        this.data.sudoAuthentication=enable;
    }

    get remoteUser() {
        return this.data.remoteUser;
    }

    get becomeUser() {
        return this.data.becomeUser;
    }

    get authentication() {
        return this.data.authentication;
    }

    set remoteUser(remoteUser) {
        if (!remoteUser) {
            //same means login as user executing vincent
            this.data.remoteUser = "currentUser";
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

    set becomeUser(becomeUser) {
        if (!becomeUser) {
            this.data.becomeUser=null;
        } else if (typeof becomeUser === 'string') {
            this.data.becomeUser = becomeUser;
        }else if (becomeUser instanceof User){
                    this.data.becomeUser = user.name;
        } else {
            logger.logAndThrow(`becomeUser must be a username or a User instance. Current value is ` +
                    `${becomeUser}.`);
        }
    }

    export() {
        let obj = {};
        if(this.data.becomeUser){
            obj.becomeUser=this.data.becomeUser;
        }
        if(this.data.remoteUser){
            obj.remoteUser = this.data.remoteUser;
        }
        if(this.data.becomeUser){
            obj.becomeUser=this.data.becomeUser;
        }
        if(this.data.authentication){
            obj.authentication = this.data.authentication;
        }
        if(this.data.sudoAuthentication){
            obj.sudoAuthentication = this.data.sudoAuthentication;
        }
        if (Object.keys(obj).length > 0){
            return obj
        }
    }
}
export default RemoteAccess;