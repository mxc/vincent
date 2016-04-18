/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
require("babel-polyfill");

class UserCategories {

    constructor() {
        // if (!provider || !(provider instanceof Provider)) {
        //     logger.logAndThrow("Parameter data provider must be of type provider");
        // }
        this._state = 'not loaded';
        this.data = {};
        this.data.configs = {};
        //this.provider = provider;
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

}


export default UserCategories;