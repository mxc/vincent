"use strict";

import User from './User';
import UserCategories from './UserCategories';
import HostUser from './HostUser';
import Provider from './../../Provider';
import logger from './../../Logger';
import Manager from '../base/Manager';

class UserManager extends Manager {

    constructor(provider) {
        if (!provider instanceof Provider || !provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validUsers = [];
        this.userCategories = new UserCategories();
    }

    initialiseHost(host){
        host.data['users'] =[];
        host._export['users']=[];
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
        } else {
            logger.logAndThrow(`The parameter user is not an instance of User.`);
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

    load(userDef, errors) {
        userDef.forEach((data) => {
            try {
                var user = new User(data);
                this.addValidUser(user);
            } catch (e) {
                logger.logAndAddToErrors(`Error validating user. ${e.message}`, errors);
            }
        });
    }

    clear() {
        this.validUsers = [];
    }

    getHostUsers(host) {
        return host.data.users;
    }

    addHostUser(host,hostUser, fromUserCategory = false) {
        if (hostUser instanceof HostUser) {
            if (this.findValidUser(hostUser.user)) {
                var foundHostUser = this.findHostUser(host,hostUser);
                if (foundHostUser) {
                    logger.info(`User ${hostUser.user.name} already exists on host,merging authorized_keys.`);
                    this.mergeHostUsers(host,foundHostUser, hostUser);
                } else {
                    host.data.users.push(hostUser);
                    hostUser.host = host;
                    if (!fromUserCategory) {
                        host._export.users.push(hostUser.export());
                    }
                }
                Array.prototype.push.apply(host.errors, hostUser.errors);
            } else {
                logger.logAndThrow(`User ${hostUser.user.name} was not found in the valid users list.`);
            }
        } else {
            logger.logAndThrow("The parameter hostUser must be of type HostUser.");
        }
    }

    mergeHostUsers(host, existingUser, newUser) {
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

    findHostUser(host,hostUser) {
        return host.data.users.find((huser)=> {
            if (huser.user.equals(hostUser.user)) {
                return huser;
            }
        });
    }

    findHostUserByName(host,userName) {
        return host.data.users.find((hostUser) => {
            if (hostUser.name === userName) {
                return hostUser;
            }
        });
    }

    updateHost(hosts, host, hostDef){
        if (hostDef.users) {
            hostDef.users.forEach(
                (userDef) => {
                    try {
                        let hostUser = new HostUser(host.provider, userDef);
                        this.addHostUser(host,hostUser);
                        Array.prototype.push.apply(
                            hosts.errors[host.name],
                            hostUser.errors);
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
                if (!host._export.includes){
                    host._export.includes={};
                }
                userCategories.forEach((userCategory) => {
                    try {
                        this.addUserCategory(host,userCategory);
                    } catch (e) {
                        hosts.errors[host.name].push(e.message);
                    }
                });
            }
        }

    }


    addUserCategory(host,userCategory) {
        //find the user category definition
        let users = this.provider.managers.users.userCategories.find(userCategory);
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
                    let newHostUser = new HostUser(this.provider, userDef);
                    this.addHostUser(host,newHostUser, true);
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
}

export default UserManager;