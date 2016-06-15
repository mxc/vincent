/**
 * Created by mark on 2016/05/30.
 */
import logger from '../../Logger';
import GroupManager from './GroupManager';
import HostGroup from './HostGroup';
import Manager from '../base/Manager';
import Provider from '../../Provider';
import GroupCategory from './GroupCategory';
import Group from "./Group";
import User from '../user/User';

class GroupCategories {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        this.provider = provider;
        this.data = [];
    }


    findCategoriesWithUser(user) {
        if ((typeof user == 'string') || user instanceof User) {
            if (user instanceof User) {
                user = user.name;
            }
            return this.data.filter((cat)=> {
                return cat.hostGroups.find((hostGroup)=> {
                    return hostGroup.members.find((tuser)=> {
                        if (tuser.name === user) {
                            return tuser;
                        }
                    });
                });
            });
        } else {
            throw new Error("Parameter user must be a username or of type User.");
        }
    }

    get categories() {
        return this.data;
    }

    addReplaceGroupCategory(categoryName, hostGroups) {
        if (typeof categoryName !== "string" || (!Array.isArray(hostGroups) && !(hostGroups instanceof GroupCategory))) {
            throw new Error("The parameter categoryName should be a string and users should be an array" +
                " of hostGroup data objects or HostGroup objects or a GroupCategory.");
        }
        let nGroupCategory;
        if (hostGroups instanceof GroupCategory) {
            nGroupCategory = hostGroups;
        } else {
            if (hostGroups[0] instanceof HostGroup) {
                nGroupCategory = new GroupCategory(categoryName, hostGroups);
            } else if (typeof hostGroups[0] === 'object') {
                let rHostGroups = [];
                hostGroups.forEach((hostGroup)=> { //parse data def structures
                    try {
                        rHostGroups.push(new HostGroup(this.provider, hostGroup));
                    } catch (e) {
                        logger.warn(e);
                        logger.logAndAddToErrors(`Skipping import of group ${hostGroup.name} as the group ins not in
                    valid groups list`, this.errors);
                    }
                    nGroupCategory = new GroupCategory(categoryName, rHostGroups);
                });
            } else {
                throw new Error("The hostGroups parameter must be an array of HostGroup instances or an array of data " +
                    "objects suitable for HostGroup instance creation.");
            }
        }

        //check if it already exists and replace it if it does
        let cGroupCategory = this.findGroupCategory(categoryName);
        if (cGroupCategory) {
            let index = this.data.indexOf(cGroupCategory);
            this.data.splice(index, 1);
        }
        if (nGroupCategory) {
            this.data.push(nGroupCategory);
        }
    }

    deleteGroupCategory(name) {
        if (!typeof name == 'string' && !name instanceof GroupCategory) {
            throw new Error("Parameter must be a group string name  or a GroupCategory object.");
        }
        if (name instanceof GroupCategory) {
            name = name.name;
        }
        this.data.find((groupCat, index, array)=> {
            if (groupCat.name === name) {
                array.splice(index, 1);
                return groupCat
            }
        });
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
        this.data.forEach((groupCategory)=> {
            arr.push(groupCategory.export());
        });
        return arr;
    }

    loadFromJson(groupCategoriesData) {
        if (Array.isArray(groupCategoriesData)) {
            groupCategoriesData.forEach((groupCategory)=> {
                if (!groupCategory.name || !groupCategory.config) {
                    logger.logAndThrow("The data must have properties name and config.");
                }
                let groupHosts = [];
                groupCategory.config.forEach((groupHost)=> {
                    try {
                        let group = new Group(groupHost.group);
                        this.provider.managers.groupManager.addValidGroup(group);
                    } catch (e) {
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
        return this;
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


}

export default GroupCategories;