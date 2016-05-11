/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import UserAccount from './UserAccount';
import UserManager from './UserManager';


class UserCategories extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this._state = 'not loaded';
        this.data = {};
        this.data.configs = {};
        this.provider = provider;
    }

    exportToEngine(engine, host, struct) {
        //no op
    }


    get configs() {
        return this.data.configs;
    }

    addUserCategory(userCategory) {
        //todo
    }

    get state() {
        return this._state;
    }

    loadFromJson(userCategoriesData) {
        if (Array.isArray(userCategoriesData)) {
            userCategoriesData.forEach((userCategory)=> {
                if (!userCategory.name || !userCategory.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[userCategory.name] = userCategory.config;
                this._state = "loaded";
            });
        } else {
            throw new Error("The userCategoriesData variable should be an array of UserDefs.");
        }
    }

    findUserCategory(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }

    exportToEngine(engine, host, struct) {
        //nothing to export
    }

    save(backup = true) {
       return  this.provider.saveToFile("includes/user-categories.json", this, backup);
    }

    /**
     * Not much to do to manipulate export format
     * @returns {{}|*}
     */
    export() {
        return this.data;
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
        }else{
            logger.warn("Cannot load includes/user-categories.json. It does not exist.")
        }
    }

    addUserCategoryToHost(host, userCategory) {
        //find the user category definition
        let users = this.findUserCategory(userCategory);
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
            users.forEach((userDataObj)=> {
                try {
                    let newUserAccount = new UserAccount(this.provider, userDataObj);
                    this.provider.managers.userManager.addUserAccountToHost(host, newUserAccount, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${userDataObj.user.name} from user category ${userCategory} - ${e.message}`);
                }
            });
            if (errors.length > 0) {
                throw new Error(errors.join("\n\r"));
            }

        } else {
            logger.logAndThrow("UserCategory ${userCategory} does not exist.");
        }
    }

    updateHost(hosts, host, hostDef) {
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

    loadConsoleUI(context) {
        //no op
    }
}


export default UserCategories;