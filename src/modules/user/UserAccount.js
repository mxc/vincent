'use strict';

import {logger} from './../../Logger';
import User from './User';
import HostComponent from './../base/HostComponent';
import AuthorizedUser from './AuthorizedUser';

/*
 Account user is a user with a list of authorized keys associate with this user account.
 */

class UserAccount extends HostComponent {
    
    constructor(provider, data) {
        super(provider);
        this.data = {authorized_keys: []};

        this.errors = [];
        if (data) {
            if (typeof data === "object") {
                //find the user from the list of parsed users for group and
                //addValidGroup user to this definition. If the user data has a state
                //of absent it will override the state of the global user definition
                //note: all the values of the global group are copied. Only state may change.
                if (!data.user || !data.user.name) {
                    logger.logAndThrow("The parameter data for UserAccount must have a property \"user\".");
                } else {
                    var user = this.provider.managers.userManager.findValidUserByName(data.user.name);
                    if (user) {
                        this.data.user = user.clone();
                        if (data.user.state === "absent") {
                            this.data.user.data.state = "absent";
                        }
                    } else {
                        logger.logAndThrow(`The user ${data.user.name} does not exist in valid users.`);
                    }
                }
                if (data.authorized_keys) {
                    if (!(Array.isArray(data.authorized_keys))) {
                        throw new Error("Authorized_keys property must be an array of objects with a name and state property.");
                    }

                    data.authorized_keys.forEach((authorizedUserDef)=> {
                        if (typeof authorizedUserDef !== "object") {
                            throw new Error("Authorized_keys must be an array of objects with a name and state property.");
                        }
                        try {
                            var user = this.provider.managers.userManager.findValidUserByName(authorizedUserDef.name);
                        } catch (e) {
                            logger.logAndAddToErrors(`Cannot add user to authorized_key - ${e.message}`, this.errors);
                        }

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
                super.load(data);
            } else {
                logger.logAndThrow("The data parameter for UserAccount must be an data object.");
            }
            this.data.source = data;
        }
    }

    addAuthorizedUser(user, state) {

        //default state to present
        if (!state) {
            state = "present";
        }

        if (typeof state !== 'string' || (state !== 'absent' && state !== "present")) {
            logger.logAndThrow("Parameter state must be either 'absent' or 'present'.");
        }

        if (user instanceof User) {
            var validUser = this.provider.managers.userManager.findValidUser(user);
            //if this is not a valid user or the user is valid
            //but marked as globally absent then don't addValidGroup keys
            if (!validUser || !validUser.key) {
                logger.logAndThrow(`The user ${user.name} is not in validUsers or does not have a public key defined.`);
            }
            //detect if we are adding an authorized users to itself

            if (validUser.name == this.user.name) {
                logger.logAndAddToErrors(`UserAccount ${validUser.name} cannot be added to itself as an authorized user.`, this.errors);
                return;
            }
            //detect if user already in keys
            let euser = this.data.authorized_keys.find((key)=> {
                if (key.name == user.name) {
                    key.state = state; //update state
                    return key.user;
                }
            });
            if (!euser) {
                try {
                    let authorizedUser = new AuthorizedUser(user);
                    if (state == "absent") {
                        authorizedUser.state = "absent";
                    } else {
                        authorizedUser.state = "present"
                    }
                    this.data.authorized_keys.push(authorizedUser);
                }catch(e){
                    logger.logAndThrow(`Error creating authorizedUser - ${e.message? e.message:e}`);
                }
            } else {
                logger.info(`User ${user.name} is already in host users authorized keys - state updated.`);
            }
        } else {
            logger.logAndThrow("The parameter user must be of type User");
        }
    }

    changeAuthorizedUserState(user,state){
        if(!user instanceof User){
            logger.logAndThrow("Parameter user must be an instance of User.");
        }
        if(state!=="present" && state!=="absent"){
            logger.logAndThrow("Parameter state must be a either 'presnet' or 'absent'.");
        }

        //detect if user already in keys
        let euser = this.data.authorized_keys.find((key)=> {
            if (key.name == user.name) {
                key.state = state; //update state
                return key.user;
            }
        });
        euser.state=state;
    }
    
    merge(userAccount) {
        if (userAccount instanceof UserAccount) {
            if (userAccount.name !== this.name) {
                logger.logAndThrow(`User ${userAccount.name} does not match ${this.data.name}`);
            }
            userAccount.authorized_keys.forEach((authorizedUser)=> {
                try {
                    this.addAuthorizedUser(authorizedUser, authorizedUser.state);
                } catch (e) {
                    this.errors.push(e.message);
                }
            });
        } else {
            logger.logAndThrow("The parameter hostUser must be of type UserAccount.");
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

    set state(state) {
        if (state !== 'present' && state !== 'absent') {
            throw new Error(`UserAccount state can only be present or absent not ${state}.`);
        }
        this.data.user.data.state = state;
    }

    export() {
        let obj = {};
        obj.user = this.data.user.exportId();
        if (this.data.user.state == "present") {
            if (this.data.authorized_keys && this.data.authorized_keys.length > 0) {
                obj.authorized_keys = [];
                this.data.authorized_keys.forEach((key)=> {
                    obj.authorized_keys.push({name: key.name, state: key.state});
                });
            }
        }
        super.export(obj);
        return obj;
    }

    clone() {
        let ua = new UserAccount(this.provider, this.export());
        return ua;
    }
}

export default UserAccount;