/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import UserManager from './UserManager';
import UserAccount from './UserAccount';
import UserCategory from './UserCategory';
import User from './User';
import Vincent from '../../Vincent';

class UserCategories extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this._state = 'not loaded';
        this.data = [];
        this.provider = provider;
        this.errors = [];
    }

    exportToEngine(engine, host, struct) {
        //no op
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
        if (typeof categoryName !== "string" || !Array.isArray(userAccounts)) {
            throw new Error("The parameter categoryName should be a string and users should be an array of user data objects and authorized_keys or userAccount objects.");
        }
        let nUserCategory;
        if (userAccounts[0] instanceof UserAccount) {
            nUserCategory = new UserCategory(categoryName, userAccounts);
        } else if (typeof userAccounts[0] === 'object') {
            let rUserAccounts = [];
            userAccounts.forEach((userAccount)=> {
                try {
                    rUserAccounts.push(new UserAccount(this.provider, userAccount));
                } catch (e) {
                    logger.warn(e);
                    logger.logAndAddToErrors(`Skipping import of user ${user.name} as user ins not in valid users list`, this.errors);
                }
                nUserCategory = new UserCategory(categoryName, rUserAccounts);
            });
            //check if it already exists
            let cUserCategory = this.findUserCategory(categoryName);
            if (cUserCategory) {
                let hosts = this.findHostsWithCategory(cUserCategory);
                hosts.forEach((host)=> {
                    this.deleteCategoryUserAccountsFromHost(host, cUserCategory);
                    this.provider.managers.userManager.addUserCategoryToHost(host, nUserCategory);
                });
                let index = this.data.indexod(cUserCategory);
                this.data.splice(index, 1);
            }
            this.data.push(nUserCategory);
        } else {
            throw new Error("The user parameter must be an array of User instances or an array of data objects suitable for UserAccount objects.");
        }
    }

    deleteCategoryUserAccountsFromHost(host, category) {
        category.userAccounts.forEach((user)=> {
            this.provider.app.managers.userManager.deleteUserFromHost(host, user.name);
        });
        let index = host._export.includes.userCategories.indexOf(category.name);
        host._export.includes.userCategories.splice(index, 1);

    }

    deleteUserCategory(name, updateHosts = true) {

        if (!typeof name == 'string' && !name instanceof UserCategory) {
            throw new Error("Parameter must be a string or a UserCategory object.");
        }
        if (name instanceof UserCategory) {
            name = name.name;
        }
        let userCat = this.data.find((userCat, index, array)=> {
            if (userCat.name === "name") {
                array.splace(index, 1);
                return userCat
            }
        });

        if (updateHosts) {
            let hosts = this.findHostsWithCategory(userCat);
            hosts.forEach((host)=> {
                this.deleteCategoryUserAccountsFromHost(host, userCat);
            });

            userCat.userAccounts.forEach((user)=> {
                this.provider.managers.userManager.deleteUser(user);
            });
        }
    }

    findHostsWithCategory(category) {
        if (typeof category === "string" || category instanceof UserCategory) {
            let hosts = this.provider.app.managers.hostManager.filter((host)=> {
                return host._export.includes.userCategories.find((cat)=> {
                    if (cat == category) {
                        return cat;
                    }
                });
            });
            return hosts;
        } else {
            logger.logAndThrow("Parameter category should be a category name or a UserCategory object");
        }

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
                            Vincent.app.provider.managers.userManager.addValidUser(user);
                        } catch (e) {
                            //swallow user exists error
                        }
                        userAccounts.push(new UserAccount(this.provider, userdef));
                    } catch (e) {
                        logger.warn(e);
                        logger.logAndAddToErrors(`Skipping import of user ${userdef.user.name} as user ins not in valid users list`, this.errors);
                    }
                });
                this.data.push(new UserCategory(userCategory.name,userAccounts));
            });
            this._state = "loaded";
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

    exportToEngine(engine, host, struct) {
        //nothing to export
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

    static getDependencies() {
        return [UserManager];
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

    loadHost(hosts, host, hostDef) {
        //Add user categories into the user array
        if (hostDef.includes) {
            let userCategories = hostDef.includes.userCategories;
            if (userCategories) {
                host.checkIncludes();
                userCategories.forEach((userCategory) => {
                    try {
                        this.addUserCategoryToHost(host, userCategory);
                    } catch (e) {
                        hosts.errors[host.name].push(e.message);
                    }
                });
            }
        }
    }

    loadConsoleUIForSession(context, appUser) {
        //no op
    }

}


export default UserCategories;