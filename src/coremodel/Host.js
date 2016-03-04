'use strict';

import Group from './Group';
import HostGroup from '../coremodel/hostcomponents/HostGroup';
import RemoteAccess from '../coremodel/hostcomponents/RemoteAccess';
import HostUser from '../coremodel/hostcomponents/HostUser';
import HostSsh from '../coremodel/hostcomponents/HostSsh';
import HostSudoEntry from '../coremodel/hostcomponents/HostSudoEntry';
import SudoEntry from '../coremodel/SudoEntry';
import Provider from './../Provider';
import logger from './../Logger';
import Base from './Base';

class Host extends Base {

    constructor(provider, data) {
        super();
        this.errors = [];
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be provided for Host.")
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
                remoteAccess: new RemoteAccess(),
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
            remoteAccess:new RemoteAccess(),
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

    get remoteAccess(){
        return this.data.remoteAccess;
    }

    get authentication(){
        return this.data.authentication;
    }

    get sudoAuthentication(){
        return this.data.sudoAuthentication;
    }

    set source(source) {
        this.data.source = source;
    }

    get users() {
        return this.data.users;
    }

    get ssh() {
        if (this.data.hostSsh) {
            return this.data.hostSsh.ssh;
        }
    }

    get groups() {
        return this.data.groups;
    }

    get sudoerEntries() {
        return this.data.sudoerEntries;
    }

    setRemoteAccess(remoteAccess){
        if (!remoteAccess instanceof RemoteAccess){
            throw new Error("The parameter remoteAccessObj must be of type RemoteAccess");
        }
        this.data.remoteAccess=remoteAccess;
        this._export.remoteAccess=remoteAccess.export();
    }

    addHostUser(hostUser, fromUserCategory = false) {
            if (hostUser instanceof HostUser) {
                if (this.provider.users.findUser(hostUser.user)) {
                    var foundHostUser = this.findHostUser(hostUser);
                    if (foundHostUser) {
                        logger.info(`User ${user.name} already exists on host,merging authorized_keys.`);
                        this.mergeUsers(foundHostUser, hostUser);
                    } else {
                        this.data.users.push(hostUser);
                        hostUser.host = this;
                        if (!fromUserCategory) {
                            this._export.users.push(hostUser.export());
                        }
                    }
                    Array.prototype.push.apply(this.errors, hostUser.errors);
                } else {
                    logger.logAndThrow(`User ${user.name} was not found in the valid users list.`);
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
                    hostGroup.host = this;
                    if (!fromGroupCategory) {
                        this._export.groups.push(hostGroup.export());
                    }
                }
                Array.prototype.push.apply(this.errors, hostGroup.errors);
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
        //find the user category definition
        let users = this.provider.userCategories.find(userCategory);
        if (users) {
            //if exists add to the export
            let userCategoriesObj = this.findInclude("userCategories");
            if (!userCategoriesObj) {
                userCategoriesObj = [];
                this._export.includes["userCategories"] = userCategoriesObj;
            }
            userCategoriesObj.push(userCategory);
            let errors = [];
            //for each user in category add to the host
            users.forEach((userDef)=> {
                try {
                    let newHostUser = new HostUser(this.provider, userDef);
                    this.addHostUser(newHostUser, true);
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${userDef.user.name} from user category ${userCategory} - ${e.message}`);
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
        //lookup host category group definition
        let groups = this.provider.groupCategories.find(groupCategory);
        //if its valid
        if (groups) {
            //add it to exports includes definition
            let groupCategoriesObj = this.findInclude("groupCategories");
            if (!groupCategoriesObj) {
                groupCategoriesObj = [];
                this._export.includes["groupCategories"] = groupCategoriesObj;
            }
            groupCategoriesObj.push(groupCategory);
            let errors = [];
            //add groups to the host definition
            groups.forEach((groupDef)=> {
                try {
                    let newGroup = new HostGroup(this.provider, groupDef);
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
            this.data.hostSsh = new HostSsh(this.provider, config);
            this.data.hostSsh.host = this;
            this._export.ssh = this.data.hostSsh.data.export();
        } else {
            let configDef = this.provider.sshConfigs.find(config);
            if(!configDef){
                throw new Error(`Ssh config '${config}' not found.`);
            }
            this.data.hostSsh = new HostSsh(this.provider,
                configDef);
            this.data.hostSsh.host = this;
            this.checkIncludes();
            this._export.includes["ssh"] = config;
        }
        Array.prototype.push.apply(this.errors, this.data.hostSsh.errors);

    }

    addSudoEntry(sudoData) {
        if (!this.data.sudoerEntries) {
            this.data.sudoerEntries = [];
        }
        try {
            if (typeof sudoData == "string") {
                if (!this._export.includes) {
                    this._export.includes = {};
                    this._export.includes.sudoerEntries = [];
                } else if (!this._export.includes.sudoerEntries) {
                    this._export.includes.sudoerEntries = [];
                }
                let sudoDataLookup = this.provider.sudoerEntries.find(sudoData);
                let hostSudoEntry = new HostSudoEntry(this.provider, this, sudoDataLookup);
                this.data.sudoerEntries.push(hostSudoEntry);
                this._export.includes.sudoerEntries.push(sudoData);
            } else {
                let hostSudoEntry = new HostSudoEntry(this.provider, this, sudoData);
                this.data.sudoerEntries.push(hostSudoEntry);
                if (!this._export.sudoerEntries) {
                    this._export.sudoerEntries = [];
                }
                this._export.sudoerEntries.push(hostSudoEntry.sudoEntry.export());
            }
        }
        catch (e) {
            logger.logAndThrow(`Error adding SudoerEntry - ${e.message}`);
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

    findUser(userName) {
        return this.data.users.find((hostUser) => {
            if (hostUser.name === userName) {
                return hostUser;
            }
        });
    }

    export() {
        return this._export;
    }
}

export default Host;