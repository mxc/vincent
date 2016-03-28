'use strict';

import Provider from './../../Provider';
import logger from './../../Logger';
import User from './User';
import Host from '../host/Host';
import HostDef from './../base/HostDef';

class HostUser extends HostDef {

    constructor(provider, data) {
        super(provider);
        this.data = {authorized_keys: []};
        this._export = {};
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
                        this._export.user = this.data.user.exportId();
                    } else {
                        logger.logAndThrow(`The user ${data.user.name} does not exist in valid users.`);
                    }
                }
                if (data.authorized_keys) {
                    data.authorized_keys.forEach((authorizedUserDef)=> {
                        if (typeof authorizedUserDef !== "object"){
                            throw new Error("Authorized_keys must be an array of userdefs.");
                        }
                        var user = this.provider.users.findUserByName(authorizedUserDef.name);
                        if (!user) {
                            logger.logAndAddToErrors(
                                `User with name ${authorizedUserDef.name} cannot be added as authorized user to ${data.user.name} as the user is invalid.`, this.errors);
                        } else {
                            try {
                                this.addAuthorizedUser(user, authorizedUserDef.state);
                            } catch (e) {
                                logger.logAndAddToErrors(`There was an error adding an authorised key to the user ${data.user.name}. ${e.message}`, this.errors);
                            }
                        }
                    });
                }
            } else {
                logger.logAndThrow("The data parameter for HostUser must be an data object or undefined.");
            }
            this.data.source = data;
        }
    }

    addAuthorizedUser(user, state) {
        //if the user has been marked as absent and will be deleted
        //authorized keys are superfluous.
        if (this.state=='absent'){
            return;
        }
        if (user instanceof User) {
            var validUser = this.provider.users.findUser(user);
            //if this is not a valid user or the user is valid
            //but marked as globally absent then don't add keys
            if (!validUser || !validUser.key) {
                logger.logAndThrow(`The user ${user.name} is not in validUsers or does not have a public key defined`);
                return;
            }
            //detect if user already in keys
            if (!this.provider.users.findUser(user, this.data.authorized_keys)) {
                let authorizedUser = user.clone();
                if (state === "absent") {
                    authorizedUser.state = "absent";
                }
                this.data.authorized_keys.push(authorizedUser);
                if (!this._export.authorized_keys){
                    this._export.authorized_keys=[];
                }
                this._export.authorized_keys.push({
                    name:  authorizedUser.name,
                    state: authorizedUser.state
                });
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
            hostUser.authorized_keys.forEach((authorizedUser)=> {
                try {
                    this.addAuthorizedUser(authorizedUser, authorizedUser.state);
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

    get state() {
        return this.data.user.state;
    }

    get name() {
        return this.data.user.name;
    }

    get authorized_keys() {
        return this.data.authorized_keys;
    }

    export() {
        return this._export;
    }

}

export default HostUser;