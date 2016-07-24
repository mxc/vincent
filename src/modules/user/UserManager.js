"use strict";

import User from './User';
import Host from '../host/Host';
import HostUI from '../host/ui/console/Host';
import UserAccountUI from './ui/console/UserAccount';
import UserManagerUI from './ui/console/UserManager';
import UserAccount from './UserAccount';
import UserCategories from './UserCategories';
import Provider from './../../Provider';
import {logger} from './../../Logger';
import PermissionsManager from '../base/PermissionsManager';

class UserManager extends PermissionsManager {

    constructor(provider) {
        if (!(provider instanceof Provider) || !provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super(provider);
        this.provider = provider;
        this.userCategories = new UserCategories(provider);
        this.validUsers = [];
        this.errors = [];
        this.engines = provider.loader.loadEngines('user', provider);
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
                return muser.name == user.name;
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
        if (typeof user == 'string') {
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
        var obj = {
            owner: this.owner,
            group: this.group,
            permissions: this.permissions.toString(8),
            users: []
        };

        this.validUsers.forEach((user)=> {
            obj.users.push(user.export());
        });
        return obj;
    }

    loadFromJson(userDef) {
        let owner = userDef.owner;
        let group = userDef.group;
        let permissions = userDef.permissions;
        if (Array.isArray(userDef.users)) {
            userDef.users.forEach((data) => {
                try {
                    var user = new User(data);
                    this.addValidUser(user);
                } catch (e) {
                    logger.logAndAddToErrors(`Error validating user. ${e.message}`, this.errors);
                }
            });
        } else {
            throw new Error("UserDef.users must be an array of users' data");
        }
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

    loadUserCategoriesFromFile() {
        this.userCategories.loadFromFile();
        return this.userCategories;
    }

    loadUserCategoriesFromJson(json) {
        this.userCategories.loadFromJson(json);
        return this.userCategories;
    }

    get categories() {
        return this.userCategories;
    }

    clear() {
        let usernames = [];
        this.validUsers.forEach((user)=> {
            usernames.push(user.name);
        });

        usernames.forEach((username)=> {
            this.changeUserState(username, "absent");
            this.deleteUser(username);
        });
    }

    getUserAccounts(host) {
        return host.data.users;
    }

    addUserAccountToHostByUserName(host, username) {
        if (!host instanceof Host) {
            logger.logAndThrow("Parameter host must be of type Host");
        }
        //update host for userAccounts
        if (!host.data.users) {
            host.data.users = [];
        }

        if (typeof username == 'string') {
            let ua = new UserAccount(this.provider, {user: {name: username}});
            this.addUserAccountToHost(host, ua);
        } else {
            logger.logAndThrow("The parameter usernamet must be of type string.");
        }
    }

    addUserAccountToHost(host, userAccount) {
        if (!host instanceof Host) {
            logger.logAndThrow("Parameter host must be of type Host");
        }
        //update host for userAccounts
        if (!host.data.users) {
            host.data.users = [];
        }

        if (userAccount instanceof UserAccount) {
            if (this.findValidUser(userAccount.user)) {
                var foundUserAccount = this.findUserAccountForHost(host, userAccount);
                if (foundUserAccount) {
                    logger.info(`User ${userAccount.user.name} already exists on host,merging authorized_keys.`);
                    this.mergeUserAccount(host, foundUserAccount, userAccount);
                } else {
                    let ua = userAccount.clone();
                    host.data.users.push(ua);
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
    }

    findUserAccountForHost(host, userAccount) {
        if (!host instanceof Host) {
            throw new Error("Parameter host must be of type Host.");
        }

        if (!(userAccount instanceof UserAccount) && (typeof userAccount !== "string")) {
            throw new Error("Parameter userAccount must be of type UserAccount or a username string.");
        }
        return host.data.users.find((huser)=> {
            if (typeof userAccount === "string") {
                if (huser.name == userAccount) {
                    return huser;
                }
            } else if (huser.name == userAccount.user.name) {
                return huser;
            }
        });
    }


    findUserAccountForUser(host, user) {
        if (host instanceof Host && user instanceof User) {
            let userAccounts = this.getUserAccounts(host);
            if (!userAccounts) return;
            let userAccount = userAccounts.find((userAccount)=> {
                if (userAccount.user.name === user.name) {
                    return userAccount;
                }
            });
            return userAccount;
        } else {
            throw new Error("Host parameter must be an instance of Host and user parameter must be an instance of User");
        }
    }

    findUserAccountForHostByUserName(host, userName) {
        if (!host instanceof Host) {
            logger.logAndThrow("Host must be an instanceof Host.");
        }
        if (!host.data.users) {
            logger.logAndThrow(`No users defined for host ${host.name}.`);
        }
        if (host instanceof Host && typeof userName == 'string') {
            return host.data.users.find((userAccount) => {
                if (userAccount.name === userName) {
                    return userAccount;
                }
            });
        } else {
            throw new Error("Parameter host must be of type Host and userName must be a string.");
        }
    }

    loadHost(hosts, host, hostDef) {
        if (hostDef.users) {
            hostDef.users.forEach(
                (userDef) => {
                    try {
                        let userAccount = new UserAccount(host.provider, userDef);
                        this.addUserAccountToHost(host, userAccount);
                        Array.prototype.push.apply(
                            hosts.errors[host.name].get(host.configGroup),
                            userAccount.errors);
                    } catch (e) {
                        logger.logAndAddToErrors(`Error adding host user - ${e.message}`,
                            hosts.errors[host.name].get(host.configGroup));
                    }
                });
        }
    }


    /**
     * Function to allow modules to manipulate the repl context to add functionality
     * @param context
     * @param appUser
     */
    loadConsoleUIForSession(context, session) {
        super.loadConsoleUIForSession(context, session);
        let self = this;
        if (!HostUI.prototype.addUserAccount) {
            HostUI.prototype.addUserAccount = function (user) {
                let func = function () {
                    let genFunc = function (obj, tsession, permObj) {
                        try {
                            var userAccount = new UserAccountUI(obj, permObj, tsession);
                            return userAccount;
                        } catch (e) {
                            logger.error(e);
                            if (!e) {
                                tsession.console.outputError("error");
                            }
                            tsession.console.outputError(`${e.message ? e.message : e}`);
                        }
                    };
                    genFunc = genFunc.bind(this);
                    return this.genFuncHelper(genFunc, user);
                };
                func = func.bind(this);
                return this._writeAttributeWrapper(func);
            };
        }

        if (!HostUI.prototype.removeUser) {
            HostUI.prototype.removeUser = function (user) {
                let func = function () {
                    let genFunc = function (obj, tsession, permObj) {
                        try {
                            let ua = this.getUserAccount(user);
                            if(ua.state!=="absent"){
                                tsession.console.outputError(`The user account for ${user} must first be marked absent before it can be removed.`);
                                return;
                            }
                            self.removeUserFromHost(permObj,user);
                            tsession.console.outputSuccess(`User ${user.name ? user.name : user} has been removed from host ${this.name}.`);
                        } catch (e) {
                            if (!e) {
                                tsession.console.outputError("error");
                            }
                            tsession.console.outputError(`${e.message ? e.message : e}`);
                        }
                    };
                    genFunc = genFunc.bind(this);
                    return this.genFuncHelper(genFunc, user);
                };
                func = func.bind(this);
                return this._writeAttributeWrapper(func);
            };
        }

        if (!HostUI.prototype.hasOwnProperty("userAccounts")) {
            let func = function () {
                let wrapperFunc = function () {
                    let host = self.provider.managers.hostManager.findValidHost(this.name, this.configGroup);
                    let ruserAccounts = self.getUserAccounts(host);
                    if (!ruserAccounts) {
                        return [];
                    }
                    return ruserAccounts.map((ua)=> {
                        return this.genFuncHelper(function (obj, tsession, permObj) {
                            return new UserAccountUI(obj, permObj, tsession);
                        }, ua);
                    });
                };
                wrapperFunc = wrapperFunc.bind(this);
                return this._readAttributeWrapper(wrapperFunc);
            };

            Object.defineProperty(HostUI.prototype, "userAccounts", {
                    get: func
                }
            );
        }


        if (!HostUI.prototype.getUserAccount) {
            HostUI.prototype.getUserAccount = function (username) {
                let func = function () {
                    try {
                        let host = self.provider.managers.hostManager.findValidHost(this.name, this.configGroup);
                        let userAccount = self.findUserAccountForHostByUserName(host, username);
                        if (userAccount) {
                            return this.genFuncHelper(function (obj, tsession, permObj) {
                                return new UserAccountUI(obj, permObj, tsession);
                            }, userAccount);
                        } else {
                            throw new Error(`No user accounts defined for host ${this.name}`);
                        }
                    } catch (e) {
                        throw new Error((`${e.message ? e.mesage : e}`));
                    }
                };
                func = func.bind(this);
                return this._readAttributeWrapper(func);
            };
        }

        context.userManager = new UserManagerUI(session);
    }


    static getDependencies() {
        return [];
    }

    save(backup = true) {
        return this.provider.saveToFile("users.json", this, backup);
    }

    /**
     * Returns an array of hosts that have user accounts for provided user and whose state is equal to the state parameter.
     *
     * @param user
     * @param state 'present','absent' or undefined for both
     * @returns {Array.<T>|*}
     */
    findHostsWithUser(user, state) {
        if (state !== 'present' && state !== 'absent' && state !== undefined) {
            throw new Error(`Parameter state must either be 'present','absent' or undefined not ${state}`);
        }
        if (typeof user !== "string" && !(user instanceof User)) {
            throw new Error("Parameter user must be a username or instance of User.");
        }
        user = this.findValidUser(user);
        if (user) {
            let hosts = this.provider.managers.hostManager.validHosts.filter((host)=> {
                if (this.findUserAccountForUser(host, user)) {
                    if (state) {
                        if (user.state === state) {
                            return host;
                        }
                    } else {
                        return host;
                    }
                }
            });
            return hosts;
        }
    }

    findUserAccountsWithAuthorizedKey(user, state = "all") {
        if (state !== 'present' && state !== 'absent' && state !== "all") {
            throw new Error(`Parameter state must either be 'present','absent' or undefined not ${state}`);
        }
        if (typeof user !== "string" && !(user instanceof User)) {
            throw new Error("Parameter user must be a username or instance of User.");
        }
        user = this.findValidUser(user);
        let userAccounts = [];
        if (user) {
            let hosts = this.provider.managers.hostManager.validHosts.forEach((host)=> {
                let uas = this.getUserAccounts(host);
                if (uas) {
                    uas.forEach((ua)=> {
                        let tua = ua.authorized_keys.find((key)=> {
                            if (key.user.name == user.name) {
                                if (state == "all") {
                                    return ua;
                                } else if (key.state == state) {
                                    return ua;
                                }
                            }
                        });
                        if (tua) {
                            userAccounts.push(tua);
                        }
                    });
                }
            });
        }
        return userAccounts;
    }

    entityStateChange(ent) {
        //noop
    }

    deleteEntity(ent) {
        //noop
    }

    changeUserState(user, state) {
        if (state !== 'absent' && state !== 'present') {
            throw new Error(`Parameter state must be 'present' or 'absent' not ${state}`);
        }
        if ((typeof user === 'string') || user instanceof User) {
            let tUser = this.findValidUser(user);
            if (tUser) {
                if (tUser.data.state == state) {
                    return;
                }
                tUser.data.state = state;
                //if use is globally marked as absent then mark user as absent in all hosts categories and groups
                if (state == 'absent') {
                    //update all useraccounts to be absent
                    let hosts = this.findHostsWithUser(tUser);
                    if (hosts) {
                        hosts.forEach((host)=> {
                            let ua = this.findUserAccountForUser(host, tUser);
                            ua.state = "absent";
                        });
                    }
                    //update all authorized_keys to "absent"
                    let uas = this.findUserAccountsWithAuthorizedKey(tUser, "present");
                    if (uas) {
                        uas.forEach((ua)=> {
                            ua.authorized_keys.find((key)=> {
                                if (key.name == tUser.name) {
                                    key.state = "absent";
                                }
                            });
                        })
                    }
                }
                this.provider.loader.callFunctionInTopDownOrder((manager)=> {
                    this.provider.getManagerFromClassName(manager).entityStateChange(user);
                });
            } else {
                logger.warn(`User ${user.name ? user.name : user} requested to be marked as ${state} is not a valid user.`);
            }
        } else {
            logger.warn("User parameter must be a username or instance of User.");
        }
    }

    deleteUser(user, updateHosts = true) {
        if ((typeof user == 'string') || user instanceof User) {
            //normalise username for search
            let username;
            if (user instanceof User) {
                username = user.name;
            } else {
                username = user;
            }

            let rUser = this.findValidUserByName(username);
            if (!rUser) {
                logger.warn("User requested to be deleted is not a valid user.");
                return;
            }
            //check if the user is currently associated with a UserAccount in any valid hosts and whose state is  "present"
            let hosts = this.findHostsWithUser(rUser, 'present');
            if (hosts.length > 0) {
                throw new Error(`User ${username} has accounts in ${hosts.length} hosts. First change user state to 'absent' before the user can be deleted.`);
            }
            let uas = this.findUserAccountsWithAuthorizedKey(rUser, "present");
            if (uas.length > 0) {
                throw new Error(`User ${username} has authorized_keys marked as present. First change authorized_keys state to 'absent' before the user can be deleted.`);
            }
            //delete user entry from userAccount entries in host as the user has been previously marked as deleted.
            if (updateHosts) {

                //remove user from hosts
                let hosts = this.provider.managers.hostManager.validHosts;
                if (hosts) {
                    hosts.forEach((host)=> {
                        this.removeUserFromHost(host, rUser, true);
                    });
                }

                this.provider.loader.callFunctionInBottomUpOrder((manager)=> {
                    this.provider.getManagerFromClassName(manager).deleteEntity(rUser);
                });

                //todo clean up userCategories?
                // can safely remove user from valid users list as no references exists from validHosts
                this.validUsers.find((user, index, array)=> {
                    if (user.name === username) {
                        array.splice(index, 1);
                        return user;
                    }
                });
            }
        } else {
            logger.warn("User parameter must be a username or instance of User.");
        }
        return true;
    }

    removeUserFromHost(host, user, global = false) {
        user = this.findValidUser(user);
        if (!user) {
            logger.logAndThrow("Parameter user must be a User object or a user name string.");
        }
        if (!(host instanceof Host)) {
                logger.logAndThrow("Parameter host must be a Host object.");
        }
        let hostUsers = this.getUserAccounts(host);
        if (hostUsers) {
            hostUsers.forEach((hostUser, index, array)=> {
                if (hostUser.user.name === user.name) {
                    array.splice(index, 1);
                    //return hostUser;
                }
                //if the user is being removes from validUsers then we need to clean up authorized_keys too.
                if (global) {
                    hostUser.authorized_keys.forEach((key, kindex, karray)=> {
                        if (key.name == user.name) {
                            karray.splice(index, 1);
                        }
                    });
                }
                //remove user from groups
                this.provider.managers.groupManager.removeUserFromHostGroups(host, user);
                //remove user from sudoer entry
                this.provider.managers.sudoManager.removeUserGroupFromHostSudoEntries(host, user);
            });
        }
    }

}

export default UserManager;