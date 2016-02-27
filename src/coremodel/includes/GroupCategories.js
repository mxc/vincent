/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import fs from 'fs';

class GroupCategories {

    constructor(provider) {

        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }

        this.data = {};
        this.data.configs = {};
        this._state="not loaded";
    }

    get configs(){
        return this.data.configs;
    }

    add(groupCategory){
        //todo
    }

    get state(){
        return this._state;
    }

    import(groupCategoriesData) {
        if (groupCategoriesData) {
            this.load(groupCategoriesData);
            return;
        }
        let configDir = provider.config.get('confdir');
        fs.readFile(configDir
            + '/db/includes/group-categories.json',(err,data)=> {
            let groupCategoriesData = JSON.parse(data);
            try{
            this.load(groupCategoriesData);
            } catch (e) {
                logger.warn("Failed to load2 Group Categories from file system.");
            }
        });
    }

    load(groupCategoriesData) {
        if (Array.isArray(groupCategoriesData)) {
            groupCategoriesData.forEach((groupCategory)=> {
                if (!groupCategory.name || !groupCategory.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[groupCategory.name] = groupCategory.config;
                this._state="loaded";
            });
        } else {
            throw new Error("The groupCategoriesData variable should be an array of GroupDefs.");
        }
    }

    find(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }
}

export default GroupCategories;