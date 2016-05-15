/**
 * Created by mark on 2016/02/20.
 */
import logger from '../../Logger';
import GroupManager from './GroupManager';
import HostGroup from './HostGroup';
import Manager from '../base/Manager';
import Provider from '../../Provider';
import GroupCategory from './GroupCategory';
import Group from "./Group";

class GroupCategories extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this.provider = provider;
        this.data = [];
        this._state = "not loaded";
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
                return cat.users.find((tuser)=> {
                    if (tuser.name === user) {
                        return tuser;
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
        } else {
            logger.warn("Cannot load includes/group-categories.json. It does not exist.")
        }
    }

    /**
     * Not much to do to manipulate export format
     * @returns {{}|*}
     */
    export() {
        let arr = [];
        this.data.forEach((groupCategory)=>{
            arr.push(groupCategory.export());
        });
        return arr;
    }

    loadFromJson(groupCategoriesData) {
        if (Array.isArray(groupCategoriesData)) {
            groupCategoriesData.forEach((groupCategory)=> {
                if (!groupCategory.name || !groupCategory.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                let groupHosts = [];
                groupCategory.config.forEach((groupHost)=> {
                    try{
                        let group = new Group(groupHost.group);
                        this.provider.managers.groupManager.addValidGroup(group);
                    }catch(e){
                        //swallow duplicate group error
                    }
                        groupHosts.push(new HostGroup(this.provider, groupHost));
                });
                this.data.push(new GroupCategory(groupCategory.name, groupHosts));
            });
            this._state = "loaded";
        } else {
            throw new Error("The groupCategoriesData variable should be an array of GroupDefs.");
        }
    }

    save(backup = true) {
        return this.provider.saveToFile("includes/group-categories.json", this, backup);
    }

    findGroupCategory(name) {
        if (typeof name === 'string') {
            return this.data.find((groupCat)=> {
                if (groupCat.name === name) {
                    return groupCat;
                }
            });
        }
    }

    clear() {
        this.data = [];
    }

    static getDependencies() {
        return [GroupManager];
    }

    addGroupCategoryToHost(host, groupCategory) {
        //lookup host category group definition
        let groupCat = this.findGroupCategory(groupCategory);
        //if it's valid
        if (groupCat) {
            //add to exports includes definition
            let groupCategoriesObj = host._export.includes.groupCategories;
            if (!groupCategoriesObj) {
                groupCategoriesObj = [];
                host._export.includes.groupCategories = groupCategoriesObj;
            }
            groupCategoriesObj.push(groupCategory);
            let errors = [];
            //add groups to the host definition
            groupCat.hostGroups.forEach((hostGroup)=> {
                try {
                    //let newGroup = new HostGroup(this.provider, hostGroup);
                    this.provider.managers.groupManager.addHostGroupToHost(host, hostGroup, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${hostGroup.group.name} from group category ${groupCategory} - ${e.message}`);
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

    loadConsoleUIForSession(context, appUser) {
        //no op
    }

}

export default GroupCategories;