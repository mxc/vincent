/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';

class GroupCategories {

    constructor() {
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