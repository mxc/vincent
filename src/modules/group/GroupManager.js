"use strict";

import Group from './Group';
import logger from './../../Logger';
import Provider from './../../Provider';
import HostGroup from './HostGroup';
import GroupCategories from './GroupCategories';
import UserManager from './../user/UserManager';
import User from './../user/User';
import ModuleLoader from '../../utilities/ModuleLoader';
import GroupManagerUI from './ui/console/GroupManager';
import HostUI from '../host/ui/console/Host';
import HostGroupUI from './ui/console/HostGroup';
import GroupUI from './ui/console/Group';
import Host from '../host/Host';
import PermissionsManager from '../base/PermissionsManager';

class GroupManager extends PermissionsManager {

    constructor(provider) {
        if (!provider instanceof Provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super(provider);
        this.provider = provider;
        this.groupCategories = new GroupCategories(provider);
        this.validGroups = [];
        this.errors = [];
        this.engines = ModuleLoader.loadEngines('group', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    get categories() {
        return this.groupCategories;
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
        }
        if (typeof group == "string") {
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
        this.permissions = groupDef.permissions;
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

        let groupnames = [];
        this.validGroups.forEach((group)=> {
            groupnames.push(group.name);
        });

        groupnames.forEach((groupname)=> {
            this.changeGroupStatus(groupname, "absent");
            this.deleteGroup(groupname);
        })

    }


    changeGroupStatus(group, status) {
        if (status !== 'absent' && status !== 'present') {
            throw new Error(`Parameter state must be 'present' or 'absent' not ${state}`);
        }

        if ((typeof group === 'string') || group instanceof Group) {
            let tGroup = this.findValidGroup(group);
            if (tGroup) {
                if (tGroup.data.state == status) {
                    return;
                }
                tGroup.data.state = status;
                //if group is globally marked as absent then mark group as absent in all hostGroups
                if (status == 'absent') {
                    //group state in hosts
                    let hosts = this.findHostsWithGroup(tGroup);
                    hosts.forEach((host)=> {
                        let hostGroups = this.getHostGroups(host);
                        hostGroups.forEach((hg)=> {
                            if (hg.name == tGroup.name) {
                                hg.state = status;
                            }
                        });
                    });
                }
            } else {
                logger.warn(`Group ${group.name ? group.name : group} requested to be marked as ${state} is not a valid group.`);
            }
        } else {
            logger.warn("Group parameter must be a groupname or instance of Group.");
        }

    }

    getValidHostGroup(group) {
        if ((typeof group == 'string') || group instanceof Group) {
            //normalise groupname for search
            let groupname;
            if (group instanceof Group) {
                groupname = group.name;
            } else {
                groupname = group;
            }
            let rGroup = this.findValidGroupByName(groupname);
            return rGroup;
        } else {
            logger.warn("Group parameter must be a groupname or instance of Group.");
        }
    }

    findAllHostGroupsForGroup(group) {
        let rGroup = this.getValidHostGroup(group);
        if (!rGroup) {
            logger.warn("Group requested to be deleted is not a valid group.");
            return;
        }
        let hgs = [];
        let hosts = this.provider.managers.hostManager.validHosts;
        hosts.forEach((host)=> {
            let hg = this.provider.managers.groupManager.findHostGroup(host, rGroup);
            if (hg) {
                hgs.push(hg);
            }
        });
        return hgs;
    }

    deleteGroup(group, updateHosts = true) {
        //check if the group is currently associated with a HostGroup in any valid hosts and whose state is "present"
        let hgs = this.findHostsWithGroup(group);
        hgs.find((hg)=> {
            if (hg.state == 'present') {
                throw new Error(`Group ${groupname} has a hostgroup in ${host.name} hosts. First change group state to 'absent' before it can be deleted.`);
            }
        });

        //delete hostGroup entry from group entries in host as the group has been previously marked as deleted.
        let rGroup = this.getValidHostGroup(group);
        if (updateHosts) {
            //remove user from hosts
            this.findHostsWithGroup(rGroup).forEach((host)=> {
                this.removeGroupFromHost(host, rGroup);
            });

            //todo clean up groupCategories?

            // can safely remove user from valid users list as no references exists from validHosts
            this.validGroups.find((group, index, array)=> {
                if (group.name === rGroup.name) {
                    array.splice(index, 1);
                    return group;
                }
            });
        }
    }

    removeGroupFromHost(host, group) {
        if (!(host instanceof Host)) {
            throw new Error("Parameter host must be an instance of Host.");
        }
        if (group instanceof Group || group instanceof Host) {

            let groupname = "";
            if (group instanceof Group) {
                groupname = group.name;
            } else {
                groupname = group;
            }

            this.getHostGroups(host).find((hg, index, array)=> {
                if (hg.group.name == groupname) {
                    array.splice(index, 1);
                    return hg;
                }
            })
        } else {
            throw new Error("Parameter group must be an instance of Group of HostGroup.");
        }
    }


    loadHost(hosts, host, hostDef) {
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
            if (data) {
                return this.loadFromJson(data);
            }
        } else {
            logger.warn("Cannot load groups.json. It does not exist.")
        }
    }

    save(backup = true) {
        return this.provider.saveToFile("groups.json", this, backup);
    }


    getHostGroups(host) {
        return host.data.groups;
    }

    findHostGroupsWithUser(user) {
        if (user instanceof User || typeof user == 'string') {
            let hostGroups = [];
            this.provider.managers.hostManager.validHosts.forEach((host)=> {
                Array.prototype.push.apply(hostGroups, this.findHostGroupsWithUserForHost(host, user));
            });
            return hostGroups;
        } else {
            throw new Error("Parameter user must be of type User or a user name string.");
        }
    }

    findHostGroupsWithUserForHost(host, user) {
        host = this.provider.managers.hostManager.findValidHost(host);
        user = this.provider.managers.userManager.findValidUser(user);
        let hostGroups = [];
        let hgs = this.provider.managers.groupManager.getHostGroups(host);
        hgs.forEach((hg)=> {
            if (hg.containsMember(user)) {
                hostGroups.push(hg);
            }
        });
        return hostGroups;
    };

    loadGroupCategoriesFromJson(json) {
        return this.groupCategories.loadFromJson(json);
    }

    loadGroupCategoriesFromFile() {
        return this.groupCategories.loadFromFile();
    }

    addHostGroupToHost(host, hostGroup) {

        //update host for userAccounts
        if (!host.data.groups) {
            host.data.groups = [];
        }

        if (hostGroup instanceof HostGroup) {
            //is the group valid?
            if (this.findValidGroup(hostGroup.group)) {
                var foundHostGroup = this.findHostGroup(host, hostGroup);
                if (foundHostGroup) {
                    logger.info(`Group ${hostGroup.group.name} already exists on host.`);
                    this.mergeGroup(host, foundHostGroup, hostGroup);
                } else {
                    let hg = hostGroup.clone();
                    host.data.groups.push(hg);
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
    }

    findHostGroup(host, group) {
        if (!(host instanceof Host) || (!(group instanceof Group) && !(group instanceof HostGroup))) {
            logger.logAndThrow("Parameter host must be an instance of Host and parameter hostGroup must be " +
                "an instance of HostGroup or Group.");
        }
        return host.data.groups.find((hgroup)=> {
            if (group instanceof Group) {
                if (hgroup.group.name === group.name) {
                    return hgroup;
                }
            } else {
                if (hgroup.group.name === group.group.name) {
                    return hgroup;
                }
            }
        });
    }

    findHostGroupByName(host, groupName) {
        if (!(host instanceof Host)) {
            logger.logAndThrow("Host must be an instanceof Host.");
        }
        if (!host.data.groups) {
            logger.logAndThrow(`No groups defined for host ${host.name}.`);
        }

        return host.data.groups.find((hostGroup) => {
            if (hostGroup.group.name === groupName) {
                return hostGroup;
            }
        });
    }

    static getDependencies() {
        return [UserManager];
    }

    loadConsoleUIForSession(context, appUser) {
        let self = this;

        if (!HostUI.prototype.addHostGroup) {
            HostUI.prototype.addHostGroup = function (data) {
                let func = function () {
                    return this.genFuncHelper(function (grp, tappUser, permObj) {
                        var hostGroup = new HostGroupUI(grp, permObj, tappUser);
                        return hostGroup;
                    }, data);
                };
                func = func.bind(this);
                return this._writeAttributeWrapper(func);
            };
        }

        if (!HostUI.prototype.listHostGroups) {
            HostUI.prototype.listHostGroups = function () {
                let host = self.provider.managers.hostManager.findValidHost(this.name);
                let hostGroups = self.getHostGroups(host);
                let func = function() {
                    if (hostGroups) {
                        return hostGroups.map((hostGroup)=> {
                            return this.genFuncHelper(function (obj, tappUser, permObj) {
                                return new HostGroupUI(obj, permObj, tappUser);
                            }, hostGroup);
                        });
                    } else {
                        return `No groups defined for host ${this.name}`;
                    }
                };
                func = func.bind(this);
                return this._readAttributeWrapper(func);
            };
        }

        if (!HostUI.prototype.hasOwnProperty("hostGroups")) {
            let func = function () {
                let wrapperFunc = function () {
                    let host = self.provider.managers.hostManager.findValidHost(this.name);
                    let rhostgroups = self.provider.managers.groupManager.getHostGroups(host);
                    return rhostgroups.map ((hg,index)=> {
                        return this.genFuncHelper(function (obj, tappUser, permObj) {
                            return new HostGroupUI(obj, permObj, tappUser);
                        }, hg);
                    });
                };
                wrapperFunc = wrapperFunc.bind(this);
                return this._readAttributeWrapper(wrapperFunc);
            };

            Object.defineProperty(HostUI.prototype, "hostGroups", {
                    get: func
                }
            );
        }


        if (!HostUI.prototype.getHostGroup) {
            HostUI.prototype.getHostGroup = function (group) {
                let func = function() {
                    let groupName = "";
                    if (typeof group == "string") {
                        groupName = group;
                    } else if (group instanceof GroupUI) {
                        groupName = group.name;
                    } else {
                        return "Parameter group must be a group name or of type Group.";
                    }
                    let host = self.provider.managers.hostManager.findValidHost(this.name);
                    let hostGroups = self.getHostGroups(host);
                    if (hostGroups) {
                        let hg = hostGroups.find((hostGroup)=> {
                            if (hostGroup.name == groupName) {
                                return hostGroup;
                            }
                        });
                        if (hg) {
                            return this.genFuncHelper(function (obj, tappUser, permObj) {
                                return new HostGroupUI(obj, permObj, tappUser);
                            }, hg);
                        }
                    } else {
                        return `No groups defined for host ${this.name}`;
                    }
                };
                func = func.bind(this);
                return this._readAttributeWrapper(func);
            };
        }
        context.groupManager = new GroupManagerUI(appUser);
    }


    updateGroupGid(group, gid) {
        let _group = this.findValidGroup(group);
        if (_group) {
            if (this.findValidGroupByGid(gid)) {
                throw new Error("A group with the gid already exists");
            } else {
                _group.data.gid = gid;
            }
        }
    }

    removeUserFromHostGroups(host, user) {
        if (!(host instanceof Host)) {
            logger.logAndThrow("Parameter host must be an instance of Host.");
        }
        if (user instanceof User) {
            user = user.name;
        }
        if (typeof user == 'string') {
            if (host.data.groups) {
                host.data.groups.forEach((hg)=> {
                    hg.removeMember(user);
                });
            }
        } else {
            logger.logAndThrow("Parameter user must be a string or instance of User.");
        }
    }

    findHostsWithGroup(group) {
        group = this.findValidGroup(group);
        return this.provider.managers.hostManager.validHosts.filter((host)=> {
            if (this.findHostGroup(host, group)) {
                return host;
            }
        });
    }
}

export default GroupManager;