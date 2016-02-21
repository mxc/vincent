/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import fs from 'fs';

class GroupCategories {

    constructor(provider, groupCategoriesData) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }

        this.data = {};
        this.data.configs = {};
        if (!groupCategoriesData) {
            groupCategoriesData = JSON.parse(fs.readFileSync(provider.configdir + '/includes/group-categories.json'));
        }
        if (Array.isArray(groupCategoriesData)) {
            groupCategoriesData.forEach((groupCategory)=> {
                if (!groupCategory.name || !groupCategory.config){
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[groupCategory.name] = groupCategory.config;
            });
        }else{
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