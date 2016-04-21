/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import GroupManager from './GroupManager';
import HostGroup from './HostGroup';
import Manager from '../base/Manager';
import Provider from '../../Provider';

class GroupCategories extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this.provider = provider;
        this.data = {};
        this.data.configs = {};
        this._state = "not loaded";
    }

    exportToEngine(engine, host, struct) {
        //no op
    }

    get configs() {
        return this.data.configs;
    }

    addGroupCategory(groupCategory) {
        //todo
    }

    get state() {
        return this._state;
    }

    loadFromFile() {
        if (this.provider.fileExists("includes/group-categories.json")) {
            let loc = "includes/group-categories.json";
            let data = this.provider.loadFromFile(loc);
            if (data) {
                return this.loadFromJson(data);
            }
        }else{
            logger.warn("Cannot load includes/group-categories.json. It does not exist.")
        }
    }

    /**
     * Not much to do to manipulate export format
     * @returns {{}|*}
     */
    export() {
        return this.data;
    }

    loadFromJson(groupCategoriesData) {
        if (Array.isArray(groupCategoriesData)) {
            groupCategoriesData.forEach((groupCategory)=> {
                if (!groupCategory.name || !groupCategory.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[groupCategory.name] = groupCategory.config;
                this._state = "loaded";
            });
        } else {
            throw new Error("The groupCategoriesData variable should be an array of GroupDefs.");
        }
    }

    save(backup = true) {
        return this.provider.saveToFile("includes/group-categories.json", this, backup);
    }

    findGroupCategory(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }

    static getDependencies() {
        return [GroupManager];
    }

    addGroupCategoryToHost(host, groupCategory) {
        //lookup host category group definition
        let groups = this.findGroupCategory(groupCategory);
        //if it's valid
        if (groups) {
            //add to exports includes definition
            let groupCategoriesObj = host._export.includes.groupCategories;
            if (!groupCategoriesObj) {
                groupCategoriesObj = [];
                host._export.includes.groupCategories = groupCategoriesObj;
            }
            groupCategoriesObj.push(groupCategory);
            let errors = [];
            //add groups to the host definition
            groups.forEach((groupDef)=> {
                try {
                    let newGroup = new HostGroup(this.provider, groupDef);
                    this.provider.managers.groupManager.addHostGroupToHost(host, newGroup, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${groupDef.group.name} from group category ${groupCategory} - ${e.message}`);
                }
            });
            if (errors.length > 0) {
                throw new Error(errors.join("\n\r"));
            }
        } else {
            logger.logAndThrow(`GroupCategory ${groupCategory} does not exist.`);
        }
    }

    updateHost(hosts, host, hostDef) {
        //Add group categories into the groups array
        if (hostDef.includes) {
            let groupCategories = hostDef.includes.groupCategories;
            if (groupCategories) {
                // if (!host._export.includes) {
                //     host._export.includes = {};
                // }
                host.checkIncludes();
                groupCategories.forEach((groupCategory) => {
                    try {
                        this.addGroupCategoryToHost(host, groupCategory);
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

export default GroupCategories;