/**
 * Created by mark on 2016/02/20.
 */
import logger from '../Logger';
import Provider from '../Provider';
import fs from 'fs';

class UserCategories {

    constructor(provider, userCategoriesData) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }

        this.data = {};
        this.data.configs = {};
        if (!userCategoriesData) {
            userCategoriesData = JSON.parse(fs.readFileSync(provider.configdir + '/includes/user-categories.json'));
        }

        userCategoriesData.forEach((userCategory)=> {
            this.data.configs[userCategory.name] = userCategory.config;
        });
    }

    find(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }
}

export default UserCategories;