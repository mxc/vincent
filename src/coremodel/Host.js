'use strict';

import Group from './Group';
import HostGroup from 'hostcomponents/HostGroup';
import HostUser from 'hostcomponents/HostUser';
import HostSsh from 'hostcomponents/HostSsh';
import Provider from './../utilities/Provider';
import logger from './../utilities/Logger';
import Base from './Base';

class Host extends Base {

    constructor(provider, data) {
        super();
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be provided for HostGroup.")
        }
        this.provider = provider;
        //check if we were provided with a host name or a data object
        if (typeof data === 'string') {
            var validip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
            var validhostname = /\w\.{2}\w/;
            if (!validip.test(data) && !validhostname.test(data)) {
                logger.logAndThrow(`${data} is an invalid host name`);
            }
            this.data = {
                name: data,
                users: [],
                groups: []
            };
            this._export = {
                name: data.name,
                users: [],
                groups: []
            };
            this.source = {};
            return;
        }

        if (!data.name) {
            logger.logAndThrow(`The parameter data must be a hostname or an object with a mandatory property \"name\".`);
        }
        this.data = {
            name: data.name,
            users: [],
            groups: [],
            applications: [],
            services: []
        };
        this._export = {
            name: data.name,
            users: [],
            groups: []
        };
    }

    get name() {
        return this.data.name;
    }

    set source(source) {
        this.data.source = source;
    }

    get users() {
        return this.data.users;
    }

    get ssh() {
        return this.data.ssh.data.data;
    }

    get groups() {
        return this.data.groups;
    }

    //findHostUserByName(username) {
    //    this.data.users.find((huser)=> {
    //        if (huser.user.equals(username)) {
    //            return huser;
    //        }
    //    });
    //}

    addHostUser(hostUser, fromUserCategory = false) {
        if (hostUser instanceof HostUser) {
            if (this.provider.users.findUser(hostUser.user)) {
                var foundHostUser = this.findHostUser(hostUser);
                if (foundHostUser) {
                    logger.info("User ${user.name} already exists on host,merging authorized_keys.");
                    this.mergeUsers(foundHostUser, hostUser);
                } else {
                    this.data.users.push(hostUser);
                    if (!fromUserCategory) {
                        this._export.users.push(hostUser.export());
                    }
                }
            } else {
                logger.logAndThrow("User ${user.name} was not found in the valid users list.");
            }
        } else {
            logger.logAndThrow("The parameter hostUser must be of type HostUser.");
        }
    }

    mergeUsers(existingUser, newUser) {
        existingUser.merge(newUser);
        this._export.users.find((user, index)=> {
            if (user.name === existingUser.name) {
                this._export.users.splice(index, 1);
                this._export.users.push(existingUser.export());
                return user;
            }
        });
    }

    findHostUser(hostUser) {
        return this.data.users.find((huser)=> {
            if (huser.user.equals(hostUser.user)) {
                return huser;
            }
        });
    }

    addHostGroup(hostGroup, fromGroupCategory = false) {
        if (hostGroup instanceof HostGroup) {
            //is the group valid?
            if (this.provider.groups.findGroup(hostGroup.group)) {
                var foundHostGroup = this.findHostGroup(hostGroup);
                if (foundHostGroup) {
                    logger.info("Group ${group.name} already exists on host.");
                    this.mergeGroup(foundHostGroup, hostGroup);
                } else {
                    this.data.groups.push(hostGroup);
                    if (!fromGroupCategory) {
                        this._export.groups.push(hostGroup.export());
                    }
                }
            } else {
                logger.logAndThrow("Group ${group.name} was not found in the valid groups list.");
            }
        } else {
            logger.logAndThrow("The parameter hostGroup must be of type HostGroup.");
        }
    }

    mergeGroup(existingGroup, newGroup) {
        existingGroup.merge(newGroup);
        //drop return group.
        this._export.groups.find((group, index)=> {
            if (group.name === existingGroup.name) {
                this._export.groups.splice(index, 1);
                this._export.groups.push(existingGroup.export());
                return group;
            }
        });
    }

    findHostGroup(hostGroup) {
        return this.data.groups.find((hgroup)=> {
            if (hgroup.group.equals(hostGroup.group)) {
                return hgroup;
            }
        });
    }

    addUserCategory(userCategory) {
        let users = this.provider.userCategories.find(userCategory);
        if (users) {
            let userCategoriesObj = this.findInclude("userCategories");
            if (!userCategoriesObj) {
                userCategoriesObj = [];
                this._export.includes["userCategories"] = userCategoriesObj;
            };
            userCategoriesObj.push(userCategory);
            let errors = [];
            users.forEach((userDef)=> {
                try {
                    let newHostUser = new HostUser(this, userDef);
                    this.addHostUser(newHostUser, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${userDef.group.name} from user category ${userCategory} - ${e.message}`);
                }
            });
            if (errors.length > 0) {
                throw new Error(errors.join("\n\r"));
            }
        } else {
            logger.logAndThrow("UserCategory ${userCategory} does not exist.");
        }
    }

    addGroupCategory(groupCategory) {
        let groups = this.provider.groupCategories.find(groupCategory);
        if (groups) {
            let groupCategoriesObj = this.findInclude("groupCategories");
            if (!groupCategoriesObj) {
                groupCategoriesObj = [];
                this._export.includes["groupCategories"] = groupCategoriesObj;
            };
            groupCategoriesObj.push(groupCategory);
            let errors = [];
            groups.forEach((groupDef)=> {
                try {
                    let newGroup = new HostGroup(this, groupDef);
                    this.addHostGroup(newGroup, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${groupDef.group.name} from group category ${groupCategory} - ${e.message}`);
                }
            });
            if (errors.length > 0) {
                throw new Error(errors.join("\n\r"));
            }
        } else {
            logger.logAndThrow("GroupCategory ${groupCategory} does not exist.");
        }
    }

    getIncludeName(include) {
        return Object.keys(include)[0];
    }

    addSsh(config) {
        if (typeof config === 'object') {
            this.data.ssh = new HostSsh(this, config);
            this._export.ssh = this.data.ssh.data.export();
        } else {
            this.data.ssh = new HostSsh(this, this.provider.sshconfigs.find(config));
            this.checkIncludes();
            this._export.includes["ssh"] = config;
        }
    }

    checkIncludes() {
        if (!this._export.includes) {
            this._export.includes = {};
        }
    }

    findInclude(include) {
        if (!this._export.includes) {
            this.checkIncludes();
            return;
        } else {
            return this._export.includes[include];
        }

    }

    findGroup(groupName) {
        return this.data.groups.find((hostGroup) => {
            if (hostGroup.name === groupName) {
                return hostGroup;
            }
        });
    }

    export() {
        //var obj = {
        //    name: this.data.name,
        //    users: [],
        //    groups: []
        //};
        //
        //this.data.users.forEach((hostuser)=> {
        //    obj.users.push(hostuser._export());
        //});
        //
        //this.data.groups.forEach((hostgroup)=> {
        //    obj.groups.push(hostgroup._export());
        //});
        //return obj;
        return this._export;
    }
}

export default Host;