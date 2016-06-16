"use strict";

import User from './User';
import Host from '../host/Host';
import HostUI from '../host/ui/console/Host';
import UserAccountUI from './ui/console/UserAccount';
import UserManagerUI from './ui/console/UserManager';
import UserAccount from './UserAccount';
import UserCategories from './UserCategories';
import Provider from './../../Provider';
import logger from './../../Logger';
import PermissionsManager from '../base/PermissionsManager';
import ModuleLoader from '../../utilities/ModuleLoader';
import Vincent from '../../Vincent';


class UserManager extends PermissionsManager {

    constructor(provider) {
        if (!provider instanceof Provider || !provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super(provider);
        this.provider = provider;
        this.userCategories = new UserCategories(provider);
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
        if (!userAccount instanceof UserAccount) {
            throw new Error("Parameter userAccount must be of type UserAccount.");
        }
        return host.data.users.find((huser)=> {
            if (huser.name == userAccount.user.name) {
                return huser;
            }
        });
    }


    findUserAccountForUser(host, user) {
        if (host instanceof Host && user instanceof User) {
            let userAccounts = this.getUserAccounts(host);
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
     * @param appUser
     */
    loadConsoleUIForSession(context, appUser) {

        let self = this;
        if (!HostUI.prototype.addUserAccount) {
            HostUI.prototype.addUserAccount = function (user) {
                let func = function (appUserP, permObj) {
                    var userAccount = new UserAccountUI(user, this, appUserP);
                    //console.log(`User account added for ${user.name ? user.name : user} to host ${this.name}.`);
                    return userAccount;
                };
                func = func.bind(this);
                return this._writeAttributeWrapper(func);
            };
        }

        if (!HostUI.prototype.listUserAccounts) {
            HostUI.prototype.listUserAccounts = function () {
                try {
                    let host = self.provider.managers.hostManager.findValidHost(this.name);
                    return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                        let userAccounts = self.getUserAccounts(host);
                        if (userAccounts) {
                            return userAccounts.map((userAcc)=> {
                                return new UserAccountUI(userAcc);
                            });
                        } else {
                            return `No user accounts defined for host ${this.name}`;
                        }
                    });
                } catch (e) {
                    //console.log(e);
                    return e.message ? e.mesage : e;
                }
            }
        }

        if (!HostUI.prototype.getUserAccount) {
            HostUI.prototype.getUserAccount = function (username) {
                try {
                    let host = self.provider.managers.hostManager.findValidHost(this.name);
                    return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                        let userAccount = self.findUserAccountForHostByUserName(host, username);
                        if (userAccount) {
                            return new UserAccountUI(userAccount, data.get(this).appUser);
                        } else {
                            return `No user accounts defined for host ${this.name}`;
                        }
                    });
                } catch (e) {
                    return e.message ? e.mesage : e;
                }
            };
        }
        context.userManager = new UserManagerUI(appUser);
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
                    //user state in hosts
                    let hosts = this.provider.managers.hostManager.validHosts;
                    hosts.forEach((host)=> {
                        let userAccount = this.findUserAccountForUser(host, tUser);
                        if (userAccount) {
                            userAccount.user.data.state = state;
                        }
                    });
                }
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
                throw new Error(`User ${username} has accounts in ${hosts.length} hosts. First change user state to 'absent' before they can be deleted.`);
            }

            //delete user entry from userAccount entries in host as the user has been previously marked as deleted.
            if (updateHosts) {
                //remove user from hosts
                this.findHostsWithUser(rUser, 'absent').forEach((host)=> {
                    this.removeUserFromHost(host, user);
                });
                //remove user from host groups
                let hgs = this.provider.managers.groupManager.findHostGroupsWithUser(rUser);
                if (hgs) {
                    hgs.forEach((hg)=> {
                        hg.removeMember(rUser);
                    });
                }
                //remove user from sudoentries
                let hses = this.provider.managers.sudoManager.findHostSudoEntriesForUser(user);
                if (hses) {
                    hses.forEach((hse)=> {
                        hse.removeUserGroup(rUser);
                    });
                }

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
    }

    removeUserFromHost(host, user) {
        user = this.findValidUser(user);
        if (!user) {
            logger.logAndThrow("Parameter user must be a User object or a user name string.");
        }
        if (!host instanceof Host) {
            logger.logAndThrow("Parameter host must be a Host object.");
        }
        let hostUsers = this.getUserAccounts(host);
        hostUsers.find((hostUser, index, array)=> {
            if (hostUser.user.name === user.name) {
                array.splice(index, 1);
                return hostUser;
            }
            //remove user from groups
            this.provider.managers.groupManager.removeUserFromHostGroups(host, user);
            //remove user from sudoer entry
            this.provider.managers.sudoManager.removeUserGroupFromHostSudoEntries(host, user);
        });
    }


}

export default UserManager;