/**
 * Created by mark on 2016/05/30.
 */


/**
 * Created by mark on 2016/02/20.
 */
import {logger} from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import UserManager from './UserManager';
import UserAccount from './UserAccount';
import UserCategory from './UserCategory';
import User from './User';
import Vincent from '../../Vincent';

class UserCategories {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        this.data = [];
        this.provider = provider;
        this.errors = [];
    }


    findCategoriesForUser(user) {
        if ((typeof user == 'string') || user instanceof User) {
            if (user instanceof User) {
                user = user.name;
            }
            return this.data.filter((cat)=> {
                return cat.userAccounts.find((userAccount)=> {
                    if (userAccount.name === user) {
                        return userAccount;
                    }
                });
            });
        } else {
            throw new Error("Parameter user must be a username or of type User.");
        }
    }

    get categories() {
        return this.data;
    }

    addReplaceUserCategory(categoryName, userAccounts) {
        if (typeof categoryName !== "string" || (!Array.isArray(userAccounts) && !(userAccounts instanceof UserCategory))){
            throw new Error("The parameter categoryName should be a string and users should be an array of user " +
                "data objects and authorized_keys or userAccount objects.");
        }
        let nUserCategory;
        if (userAccounts instanceof UserCategory) {
            nUserCategory = userAccounts;
        } else {
            if (userAccounts[0] instanceof UserAccount) {
                nUserCategory = new UserCategory(categoryName, userAccounts);
            } else if (typeof userAccounts[0] === 'object') { //process passed in datadef structures
                let rUserAccounts = [];
                userAccounts.forEach((userAccount)=> {
                    try {
                        rUserAccounts.push(new UserAccount(this.provider, userAccount));
                    } catch (e) {
                        logger.warn(e);
                        logger.logAndAddToErrors(`Skipping import of user ${user.name} as user ins not in valid users
                         list`, this.errors);
                    }
                    nUserCategory = new UserCategory(categoryName, rUserAccounts);
                });
            } else {
                throw new Error("The userAccounts parameter must be an array of UserAccount instances or an array of " +
                    "data objects  suitable for UserAccount objects or a UserCategory object.");
            }
        }
        //check if it already exists and replace it if it does
        let cUserCategory = this.findUserCategory(categoryName);
        if (cUserCategory) {
            let index = this.data.indexOf(cUserCategory);
            this.data.splice(index, 1);
        }
        if (nUserCategory) {
            this.data.push(nUserCategory);
        }

    }

    deleteUserCategory(name) {
        if (!typeof name == 'string' && !(name instanceof UserCategory)) {
            throw new Error("Parameter must be a string or a UserCategory object.");
        }
        if (name instanceof UserCategory) {
            name = name.name;
        }
        this.data.find((userCat, index, array)=> {
            if (userCat.name === name) {
                array.splice(index, 1);
                return userCat
            }
        });
    }

    loadFromJson(userCategoriesData) {
        if (Array.isArray(userCategoriesData)) {
            userCategoriesData.forEach((userCategory)=> {
                if (!userCategory.name || !userCategory.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                let userAccounts = [];
                userCategory.config.forEach((userdef)=> {
                    try {
                        let user = new User(userdef.user);
                        try {
                            this.provider.managers.userManager.addValidUser(user);
                        } catch (e) {
                            //swallow user exists error
                        }
                        userAccounts.push(new UserAccount(this.provider, userdef));
                    } catch (e) {
                        logger.warn(e);
                        logger.logAndAddToErrors(`Skipping import of user ${userdef.user.name} as user ins not in valid users list`, this.errors);
                    }
                });
                this.data.push(new UserCategory(userCategory.name, userAccounts));
            });
        } else {
            throw new Error("The userCategoriesData variable should be an array of UserDefs.");
        }
    }

    findUserCategory(name) {
        if (!(name instanceof UserCategory) && !(typeof name == 'string')) {
            throw new Error("Parameter must be a string or a UserCategory object.");
        }
        if (name instanceof UserCategory) {
            name = name.name;
        }
        return this.data.find((userCategory)=> {
            if (userCategory.name === name) {
                return userCategory;
            }
        });
    }

    clear() {
        this.data = [];
    }

    save(backup = true) {
        return this.provider.saveToFile("includes/user-categories.json", this, backup);
    }

    /**
     * Not much to do to manipulate export format
     * @returns {{}|*}
     */
    export() {
        let arr = [];
        this.data.forEach((userCategory)=> {
            arr.push(userCategory.export());
        });
        return arr;
    }


    loadFromFile() {
        if (this.provider.fileExists("includes/user-categories.json")) {
            let data = this.provider.loadFromFile("includes/user-categories.json");
            if (data) {
                return this.loadFromJson(data);
            }
        } else {
            logger.warn("Cannot load includes/user-categories.json. It does not exist.")
        }
    }

    addUserCategoryToHost(host, userCategory) {
        if (typeof userCategory === 'string' || userCategory instanceof UserCategory) {
            if (userCategory instanceof UserCategory) {
                userCategory = userCategory.name;
            }
            //find the user category definition
            let rUserCategory = this.findUserCategory(userCategory);
            if (rUserCategory) {
                //if exists add to the export
                let userCategoriesObj = host._export.includes.userCategories;
                if (!userCategoriesObj) {
                    userCategoriesObj = [];
                    host._export.includes.userCategories = userCategoriesObj;
                }
                userCategoriesObj.push(userCategory);
                let errors = [];
                //for each user in category add to the host
                rUserCategory.userAccounts.forEach((userAccount)=> {
                    try {
                        userAccount = userAccount.clone();
                        this.provider.managers.userManager.addUserAccountToHost(host, userAccount, true);
                    } catch (e) {
                        logger.warn(`Warning adding user category: ${e.message}`);
                        errors.push(`Error adding ${userAccount.user.name} from user category ${userCategory} - ${e.message}`);
                    }
                });
                if (errors.length > 0) {
                    throw new Error(errors.join("\n\r"));
                }

            } else {
                logger.logAndThrow(`UserCategory ${userCategory} does not exist.`);
            }
        } else {
            logger.logAndThrow("UserCategory parameter must be a user category name or a UserCategory object.");
        }
    }

}


export default UserCategories;

