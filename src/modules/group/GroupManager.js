"use strict";

import Group from './Group';
import logger from './../../Logger';
import Provider from './../../Provider';
import PermissionsManager from './../base/PermissionsManager';
import HostGroup from './HostGroup';
import UserManager from './../user/UserManager';
import ModuleLoader from '../../utilities/ModuleLoader';
import ConsoleGroupManager from './ui/console/GroupManager';
import ConsoleGroup from './ui/console/Group';
import ConsoleHostGroup from './ui/console/HostGroup';


class GroupManager extends PermissionsManager {

    constructor(provider) {
        if (!provider instanceof Provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validGroups = [];
        this.errors = [];
        this.engines = ModuleLoader.loadEngines('group', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    addValidGroup(group) {
        if (group instanceof Group) {
            var tmpGroup = this.findValidGroupByName(group.name);
            if (tmpGroup) {
                if (tmpGroup.gid !== group.gid) {
                    logger.logAndThrow(`Group ${group.name} already exists with different group id`);
                } else {
                    logger.logAndThrow(`Group ${group.name} already exists.`)
                }
            } else {
                tmpGroup = group.gid ? this.findValidGroupByGid(group.gid) : undefined;
                if (tmpGroup) {
                    logger.logAndThrow(`Group ${group.name} with gid ${group.gid} already exists as ${tmpGroup.name} with gid ${tmpGroup.gid}.`);
                } else {
                    this.validGroups.push(group);
                }
            }
        } else {
            logger.logAndThrow("Parameter group must be of type Group");
        }
    }

    findValidGroup(group) {
        if (group instanceof Group) {
            return this.validGroups.find((mgroup) => {
                return mgroup.equals(group);
            });
        }if(typeof Group==="string"){
            return this.findValidGroupByName(group);
        } else {
            logger.logAndThrow(`The parameter group is not an instance of Group`);
        }
    }

    findValidGroupByName(group) {
        if (typeof group === 'string') {
            return this.validGroups.find((mgroup) => {
                if (mgroup.name === group) {
                    return mgroup;
                }
            });
        } else {
            logger.logAndThrow(`The parameter group should be a group name string`);
        }
    }

    findValidGroupByGid(gid) {
        if (!gid) {
            logger.warn("gid is undefined");
            return;
        }
        if (typeof gid === 'number') {
            return this.validGroups.find((mgroup) => {
                if (mgroup.gid === gid) {
                    return mgroup;
                }
            });
        } else {
            logger.logAndThrow(`The parameter group should be a gid`);
        }
    }

    loadFromJson(groupDef) {
        this.owner = groupDef.owner;
        this.group = groupDef.group;
        this.permissions=groupDef.permissions;
        if (Array.isArray(groupDef.groups)) {
            groupDef.groups.forEach((data) => {
                try {
                    var group = new Group(data);
                    this.addValidGroup(group);
                } catch (e) {
                    logger.logAndAddToErrors(`Error validating group. ${e.message}`, this.errors);
                }
            });
        } else {
            throw new Error("GroupDef.groups must be an array of groups' data");
        }
    }

    export() {
        var obj = {
            owner: this.owner,
            group: this.group,
            permissions: this.permissions,
            groups: []
        };
        this.validGroups.forEach((group)=> {
            obj.groups.push(group.export());
        });
        return obj;
    }

    clear() {
        this.validGroups = [];
    }

    updateHost(hosts, host, hostDef) {
        //group and group membership validation
        if (hostDef.groups) {
            hostDef.groups.forEach((groupDef) => {
                try {
                    let hostGroup = new HostGroup(host.provider, groupDef);

                    this.addHostGroupToHost(host, hostGroup);
                    Array.prototype.push.apply(hosts.errors[host.name], hostGroup.errors);
                } catch (e) {
                    logger.logAndAddToErrors(`Error adding host group - ${e.message}`,
                        hosts.errors[host.name]);
                }
            });
        }
  }

    loadFromFile() {
        if (this.provider.fileExists("groups.json")) {
                let loc = "groups.json";
                let data = this.provider.loadFromFile(loc);
                if(data){
                    return this.loadFromJson(data);
                }
        }else{
            logger.warn("Cannot load groups.json. It does not exist.")
        }
    }

    save(backup = true) {
        return this.provider.saveToFile("groups.json",this,backup);
    }


    getHostGroups(host) {
        return host.data.groups;
    }

    addHostGroupToHost(host, hostGroup, fromGroupCategory = false) {

        //update host for userAccounts
        if (!host.data.groups) {
            host.data.groups = [];
        }

        if (!host._export.groups) {
            host._export.groups = [];
        }

        if (hostGroup instanceof HostGroup) {
            //is the group valid?
            if (this.findValidGroup(hostGroup.group)) {
                var foundHostGroup = this.findHostGroup(host, hostGroup);
                if (foundHostGroup) {
                    logger.info(`Group ${hostGroup.group.name} already exists on host.`);
                    this.mergeGroup(host, foundHostGroup, hostGroup);
                } else {
                    host.data.groups.push(hostGroup);
                    hostGroup.host = host;
                    if (!fromGroupCategory) {
                        host._export.groups.push(hostGroup.export());
                    }
                }
                Array.prototype.push.apply(host.errors, hostGroup.errors);
            } else {
                logger.logAndThrow(`Group ${group.name} was not found in the valid groups list.`);
            }
        } else {
            logger.logAndThrow("The parameter hostGroup must be of type HostGroup.");
        }
    }

    mergeGroup(host, existingGroup, newGroup) {
        existingGroup.merge(newGroup);
        //drop return group.
        host._export.groups.find((group, index)=> {
            if (group.name === existingGroup.name) {
                host._export.groups.splice(index, 1);
                host._export.groups.push(existingGroup.export());
                return group;
            }
        });
    }

    findHostGroup(host, hostGroup) {
        return host.data.groups.find((hgroup)=> {
            if (hgroup.group.name ===hostGroup.group.name) {
                console.log(`found ${hgroup.group.name}`);
                return hgroup;
            }
        });
    }

    findHostGroupByName(host, groupName) {
        return host.data.groups.find((hostGroup) => {
            if (hostGroup.group.name === groupName) {
                return hostGroup;
            }
        });
    }

    static getDependencies() {
        return [UserManager];
    }

    loadConsoleUIForSession(context,appUser) {
        let self = this;
        context.Host.prototype.addHostGroup = function (data) {
            try {
                let host = self.provider.managers.hostManager.findValidHost(this.name);
                if (!host) {
                    console.log(`Could not find ${this.name} in host managers host list`);
                    return;
                }
                if (typeof data === "string") {
                    console.log("data="+data);
                    var _group = self.provider.managers.groupManager.findValidGroupByName(data);
                } else if (typeof data === "object" && data.name) {
                    var _group = self.provider.managers.groupManager.findValidGroupByName(data.name);
                }
                if (_group) {
                    let groupdata = {
                        group: _group
                    };
                    if (data.members) {
                        groupdata.members = data.members;
                    }
                    let hostGroup = new HostGroup(self.provider, groupdata);
                    self.addHostGroupToHost(host, hostGroup);
                } else {
                    console.log("group not found in valid group list");
                    return;
                }
                console.log(`Group account added for ${data.name? data.name: data} to host ${this.name}`);
            } catch (e) {
                console.log(e);
            }
        };
        context.Host.prototype.listHostGroups = function () {
            let host = self.provider.managers.hostManager.findValidHost(this.name);
            let hostGroups = self.getHostGroups(host);
            if (hostGroups) {
                return hostGroups.map((hostGroup)=> {
                    return new ConsoleHostGroup(hostGroup);
                });
            }else{
                return `No groups defined for host ${this.name}`;
            }
        };

        context.groupManager = new ConsoleGroupManager();
        context.Group = ConsoleGroup;
    }
    
    
    updateGroupGid(group, gid){
        let _group =  this.findValidGroup(group);
        if(_group){
            if(this.findValidGroupByGid(gid)){
                throw new Error("A group with the gid already exists");
            }else{
                _group.data.gid=gid;
            }
        }
    }
}

export default GroupManager;