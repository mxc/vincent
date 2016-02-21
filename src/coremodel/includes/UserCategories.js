/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../utilities/Logger';
import Provider from '../../utilities/Provider';
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

        if (Array.isArray(userCategoriesData)) {
            userCategoriesData.forEach((userCategory)=> {
                this.data.configs[userCategory.name] = userCategory.config;
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