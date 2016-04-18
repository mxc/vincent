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


class UserManager extends Manager {

    constructor(provider) {
        if (!provider instanceof Provider || !provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validUsers = [];
        this.userCategories = new UserCategories();
        this.errors = [];
        this.engines = ModuleLoader.loadEngines('user', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    //The list of users which are valid for this environment
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

    //find a user in an array of User objects.
    //if the 2nd parameter is not provided it defaults to the
    //array of validUsers contained in UserManager.
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
        let promises = [];
        promises.push(new Promise((resolve, reject)=> {
                let loc = "users.json";
                this.provider.loadFromFile(loc).then(data=> {
                    this.loadFromJson(data);
                    resolve("success");
                }).catch(e=> {
                    console.log(e);
                    logger.logAndAddToErrors(`could not load users.json file - ${e.message}`, this.errors);
                    reject(e);
                });
            })
        );

        promises.push(new Promise((resolve, reject)=> {
                this.provider.loadFromFile("includes/user-categories.json").then(data=> {
                    this.loadUserCategoriesFromJson(data);
                    resolve("success");
                }).catch(e=> {
                    console.log(e);
                    logger.logAndAddToErrors(`Failed to load User Categories from file system - ${e}`, this.errors);
                    reject(e);
                });
            })
        );

        return Promise.all(promises);
    }

    loadUserCategoriesFromJson(userCategoryData) {
        this.userCategories.loadFromJson(userCategoryData);
    }

    clear() {
        this.validUsers = [];
    }

    getHostGroups(host) {
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

        //Add user categories into the user array
        if (hostDef.includes) {
            let userCategories = hostDef.includes.userCategories;
            if (userCategories) {
                // if (!host._export.includes) {
                //     host._export.includes = {};
                // }
                host.checkIncludes();
                userCategories.forEach((userCategory) => {
                    try {
                        this.addUserCategory(host, userCategory);
                    } catch (e) {
                        hosts.errors[host.name].push(e.message);
                    }
                });
            }
        }
    }

    addUserCategory(host, userCategory) {
        //find the user category definition
        let users = this.provider.managers.userManager.userCategories.findUserCategory(userCategory);
        if (users) {
            //if exists add to the export
            let userCategoriesObj = host._export.includes.userCategories;
            if (!userCategoriesObj) {
                userCategoriesObj = [];
                host._export.includes.userCategories = userCategoriesObj;
            }
            userCategoriesObj.push(userCategory);
            let errors = [];
            //for each user in category add to the host
            users.forEach((userDef)=> {
                try {
                    let newUserAccount = new UserAccount(this.provider, userDef);
                    this.addUserAccountToHost(host, newUserAccount, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${userDef.user.name} from user category ${userCategory} - ${e.message}`);
                }
            });
            if (errors.length > 0) {
                throw new Error(errors.join("\n\r"));
            }

        } else {
            logger.logAndThrow("UserCategory ${userCategory} does not exist.");
        }
    }

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
            let userAccounts = self.getHostGroups(host);
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
        return [HostManager];
    }
}

export default UserManager;