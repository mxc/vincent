"use strict";

import User from './User';
import Host from '../host/Host';
import UserCategories from './UserCategories';
import ConsoleUser from './ui/console/User';
import ConsoleUserAccount from './ui/console/UserAccount';
import ConsoleUserManager from './ui/console/UserManager';
import HostManager from '../host/HostManager';
import UserAccount from './UserAccount';
import Provider from './../../Provider';
import logger from './../../Logger';
import Manager from '../base/Manager';
import ModuleLoader from '../../utilities/ModuleLoader';
import CheckAccess from '../base/Security';
import path from "path";


class UserManager extends Manager {

    constructor(provider) {
        if (!provider instanceof Provider || !provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validUsers = [];
        this.errors = [];
        this.engines = ModuleLoader.loadEngines('user', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }


    /**
     * The list of users which are valid for this database
     * @param user
     */
    addValidUser(user) {
        if (user instanceof User) {
            var mUser = this.findValidUserByName(user.name);
            if (!mUser) {
                mUser = this.findValidUserByUid(user.uid);
                if (mUser) {
                    logger.logAndThrow(`User ${user.name} already exists with uid ${mUser.uid}.`);
                }
                this.validUsers.push(user);
            } else {
                logger.logAndThrow(`User ${user.name} already exists.`);
            }
        } else {
            logger.logAndThrow('The parameter user needs to be of type User.');
        }
    }

    /**
     *
     *find a user in an array of User objects.
     *if the 2nd parameter is not provided it defaults to the
     *array of validUsers contained in UserManager.
     *
     * @param user
     * @param validUsers
     * @returns {*}
     */
    findValidUser(user, validUsers) {
        if (!validUsers) {
            validUsers = this.validUsers;
        }
        if (user instanceof User) {
            return validUsers.find((muser)=> {
                return muser.equals(user);
            });
        }
        if (typeof user === "string") {
            return this.findValidUserByName(user);
        } else {
            logger.logAndThrow(`The parameter user is not an instance of User nor a string user name.`);
        }
    }

    /**
     * Find a User object by name(key)
     * @param user
     * @returns {T}
     */
    findValidUserByName(user) {
        if (typeof user === 'string') {
            return this.validUsers.find((muser)=> {
                if (muser.name === user) {
                    return muser;
                }
            });
        } else {
            logger.logAndThrow(`The parameter user should be a user name string.`);
        }
    }

    /**
     * Find a user by their uid
     * @param uid
     * @returns {T}
     */
    findValidUserByUid(uid) {
        if (!uid) {
            logger.warn("uid is undefined.");
            return;
        }
        if (typeof uid === 'number') {
            return this.validUsers.find((muser)=> {
                return muser.uid === uid;
            });
        } else {
            logger.logAndThrow(`The parameter uid should be a number.`);
        }
    }

    export() {
        var obj = [];
        this.validUsers.forEach((user)=> {
            obj.push(user.export());
        });
        return obj;
    }

    loadFromJson(userDef) {
        userDef.forEach((data) => {
            try {
                var user = new User(data);
                this.addValidUser(user);
            } catch (e) {
                logger.logAndAddToErrors(`Error validating user. ${e.message}`, this.errors);
            }
        });
    }

    loadFromFile() {
        if (this.provider.fileExists("users.json")) {
            let loc = "users.json";
            let data = this.provider.loadFromFile(loc);
            if (data) {
                return this.loadFromJson(data);
            }
        } else {
            logger.warn("users.json file not found");
        }
    }


    clear() {
        this.validUsers = [];
    }

    getUserAccounts(host) {
        return host.data.users;
    }

    updateUserUid(user, uid) {
        let _user = this.findValidUser(user)
        if (_user) {
            if (this.findValidUserByUid(uid)) {
                throw new Error("A user with the uid already exists");
            } else {
                _user.data.uid = uid;
            }
        }
    }

    addUserAccountToHost(host, userAccount, fromUserCategory = false) {
        if (!host instanceof Host) {
            logger.logAndThrow("Parameter host must be of type Host");
        }
        //update host for userAccounts
        if (!host.data.users) {
            host.data.users = [];
        }

        if (!host._export.users) {
            host._export.users = [];
        }

        if (userAccount instanceof UserAccount) {
            if (this.findValidUser(userAccount.user)) {
                var foundUserAccount = this.findUserAccountForHost(host, userAccount);
                if (foundUserAccount) {
                    logger.info(`User ${userAccount.user.name} already exists on host,merging authorized_keys.`);
                    this.mergeUserAccount(host, foundUserAccount, userAccount);
                } else {
                    host.data.users.push(userAccount);
                    userAccount.host = host;
                    if (!fromUserCategory) {
                        host._export.users.push(userAccount.export());
                    }
                }
                Array.prototype.push.apply(host.errors, userAccount.errors);
            } else {
                logger.logAndThrow(`User ${userAccount.user.name} was not found in the valid users list.`);
            }
        } else {
            logger.logAndThrow("The parameter userAccount must be of type UserAccount.");
        }
    }

    mergeUserAccount(host, existingUser, newUser) {
        //merge user objects
        existingUser.merge(newUser);
        //update the exports data structure
        host._export.users.find((user, index)=> {
            if (user.name === existingUser.name) {
                host._export.users.splice(index, 1);
                host._export.users.push(existingUser.export());
                return user;
            }
        });
    }

    findUserAccountForHost(host, hostUser) {
        return host.data.users.find((huser)=> {
            if (huser.user.equals(hostUser.user)) {
                return huser;
            }
        });
    }

    findUserAccountForHostByName(host, userName) {
        return host.data.users.find((userAccount) => {
            if (userAccount.name === userName) {
                return userAccount;
            }
        });
    }

    updateHost(hosts, host, hostDef) {
        if (hostDef.users) {
            hostDef.users.forEach(
                (userDef) => {
                    try {
                        let userAccount = new UserAccount(host.provider, userDef);
                        this.addUserAccountToHost(host, userAccount);
                        Array.prototype.push.apply(
                            hosts.errors[host.name],
                            userAccount.errors);
                    } catch (e) {
                        logger.logAndAddToErrors(`Error adding host user - ${e.message}`,
                            hosts.errors[host.name]);
                    }
                });
        }

    }

    /**
     * Function to allow modules to manipulate the repl context to add functionality
     * @param context
     */
    loadConsoleUI(context) {
        let self = this;
        context.Host.prototype.addUserAccount = function (user) {
            try {
                let host = self.provider.managers.hostManager.findValidHost(this.name);
                if (!host) {
                    console.log(`Could not find ${this.name} in host managers host list`);
                    return;
                }
                if (typeof user === "string") {
                    var _user = self.provider.managers.userManager.findValidUserByName(user);
                } else if (typeof user === "object" && user.name) {
                    var _user = self.provider.managers.userManager.findValidUserByName(user.name);
                }
                if (_user) {
                    let userdata = {user: _user};
                    if (user.authorized_keys) {
                        userdata.authorized_keys = user.authorized_keys;
                    }
                    let userAccount = new UserAccount(self.provider, userdata);
                    self.addUserAccountToHost(host, userAccount);
                } else {
                    console.log("user not found in valid user list");
                    return;
                }
                console.log(`User account added for ${user.name ? user.name : user} to host ${this.name}`);
            } catch (e) {
                console.log(e);
            }
        };
        context.Host.prototype.listUserAccounts = function () {
            let host = self.provider.managers.hostManager.findValidHost(this.name);
            let userAccounts = self.getUserAccounts(host);
            if (userAccounts) {
                return userAccounts.map((userAcc)=> {
                    return new ConsoleUserAccount(userAcc);
                });
            } else {
                return `No user accounts defined for host ${this.name}`;
            }
        };

        context.userManager = new ConsoleUserManager();
        context.User = ConsoleUser;
    }

    static getDependencies() {
        return [];
    }

    save(backup = true) {
        return this.provider.saveToFile("users.json", this, backup);
    }

}

export default UserManager;