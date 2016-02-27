/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import fs from 'fs';

class UserCategories {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        this._state ='not loaded';
        this.data = {};
        this.data.configs = {};
    }

    get configs(){
        return this.data.configs;
    }

    add(userCategory){
        //todo
    }

    get state(){
        return this._state;
    }

    import(userCategoriesData) {
        if (userCategoriesData) {
            this.load(userCategoriesData);
            return;
        }
        let configDir = provider.config.get('confdir');
        fs.readFile(
            configDir + '/db/includes/user-categories.json', (err, data)=> {
                userCategoriesData = JSON.parse(data);
                try {
                    this.load(userCategoriesData);
                } catch (e) {
                    logger.warn("Failed to load2 User Categories from file system.");
                }
            });
    }

    load(userCategoriesData) {
        if (Array.isArray(userCategoriesData)) {
            userCategoriesData.forEach((userCategory)=> {
                if (!userCategory.name || !userCategory.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[userCategory.name] = userCategory.config;
                this._state="loaded";
            });
        } else {
            throw new Error("The userCategoriesData variable should be an array of UserDefs.");
        }
    }

    find(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }

}


export default UserCategories;