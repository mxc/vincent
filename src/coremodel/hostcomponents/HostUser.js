'use strict';

import Provider from './../../Provider';
import logger from './../../Logger';
import User from './../User';
import Host from './../Host';
import HostDef from './HostDef';

class HostUser extends HostDef {

    constructor(host, data) {
        super(host);
        this.data = {authorized_keys: []};
        this.errors = [];
        if (data) {
            if (typeof data === "object") {
                //find the user from the list of parsed users for group and
                //add user to this definition. If the user data has a state
                //of absent it will override the state of the global user definition
                //note: all the values of the global group are copied. Only state may change.
                if (!data.user || !data.user.name) {
                    logger.logAndThrow("The parameter data for HostUser must have a property \"user\".");
                } else {
                    var user = this.provider.users.findUserByName(data.user.name);
                    if (user) {
                        this.data.user = user.clone();
                        if (data.user.state === "absent") {
                            this.data.user.state = "absent";
                        }
                    } else {
                        logger.logAndThrow(`The user ${data.user.name} does not exist in valid users.`);
                    }
                }
                if (data.authorized_keys) {
                    data.authorized_keys.forEach((username)=> {
                        var user = this.provider.users.findUserByName(username);
                        if (!user) {
                            logger.logAndAddToErrors(
                                `User with name ${username} cannot be added as authorized user to ${data.user.name} as the user is invalid.`, this.errors);
                        } else {
                            try {
                                this.addAuthorizedUser(user);
                            } catch (e) {
                                logger.logAndAddToErrors(`There was an error adding an authorised key to the user ${data.user.name}. ${e.message}`, this.errors);
                            }
                        }
                    });
                }
            } else {
                logger.logAndThrow("The data parameter ofr HostUser must be an data object or undefined.");
            }
            this.data.source = data;
        }
    }

    addAuthorizedUser(user) {
        if (user instanceof User) {
            var validUser = this.provider.users.findUser(user);
            //if this is not a valid user or the user is valid
            //but marked as globally absent then don't add keys
            if (!validUser || validUser.state === "absent" || !validUser.key) {
                logger.logAndThrow(`The user ${user.name} is not in validUsers, is absent or does not have an public key defined`);
                return;
            }
            if (!this.provider.users.findUser(user, this.data.authorized_keys)) {
                this.data.authorized_keys.push(user.clone());
            } else {
                logger.info(`User ${user.name} is already in host users authorized keys`);
            }
        } else {
            logger.logAndThrow("The parameter user must be of type User");
        }
    }

    merge(hostUser) {
        if (hostUser instanceof HostUser) {
            if (hostUser.name !== this.name) {
                logger.logAndThrow(`User ${hostUser.name} does not match ${this.data.name}`);
            }
            hostUser.authorized_keys.forEach((user)=> {
                try {
                    this.addAuthorizedUser(user);
                } catch (e) {
                    this.errors.push(e.message);
                }
            });
        } else {
            logger.logAndThrow("The parameter hostUser must be of type HostUser.");
        }
    }

    get user() {
        return this.data.user;
    }

    get name(){
        return this.data.user.name;
    }
    get authorized_keys() {
        return this.data.authorized_keys;
    }

    export() {
        var obj = {};
        obj.user = this.data.user.exportId();
        //if (this.data.authorized_keys && this.data.authorized_keys.length>0) {
            obj.authorized_keys = [];
            this.data.authorized_keys.forEach((user)=> {
                obj.authorized_keys.push(user.name);
            });
        //}
        return obj;
    }

}

export default HostUser;