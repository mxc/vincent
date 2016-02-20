"use strict";

import Provider from '../model/Provider';
import User from '../model/User';
import Group from '../model/Group';
import Host from '../model/Host';
import HostUser from '../model/HostUser';
import HostGroup from '../model/HostGroup';
import logger from '../model/Logger';

class Controller {

    constructor(provider) {
        if (!provider || !provider instanceof Provider) {
            throw new Error("Parameter provider must be provided for HostGroup.")
        }
        this.errors = [];
        this.provider = provider;
    }

    setGroupCategories(groupCategories) {
        //we need to lookup user categories in group categories so there is
        //a loading dependency order.
        if (!this.userCategories) {
            logger.logAndThrow("user categories must be set before loading group categories");
        }

        if (!groupCategories) {
            groupCategories = JSON.parse(fs.readFileSync(this.config.confdir + 'includes/group-categories.js'));
        }

        //parse category groups to update for members which reference a user category.
        for (var groupCategory in groupCategories) {
            groupCategories[groupCategory].forEach((group)=> {
                var parsedGroupMembers = [];
                group.members.forEach((member)=> {
                    if (this.userCategories[member]) {
                        var usernames = this.userCategories[member].map((user)=> {
                            return user.name;
                        });
                        parsedGroupMembers = parsedGroupMembers.concat(usernames);
                    } else {
                        parsedGroupMembers.push(member)
                    }
                });
                group.members = parsedGroupMembers;
            });
        }
        this.groupCategories = groupCategories;
    }

    //Check that the model is consistent.
    validateModel() {
        //reset errors array at beginning of validation
        this.errors.length = 0;

        //basic user configuration validation
        this.parsedUsers = this.validateUsers(users);
        ////basic group configuration validation
        this.parsedGroups = this.validateGroups(groups);
        ////basic host configuration validation
        this.parsedHosts = this.validateHosts(users, groups);
        if (this.errors.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    validateGroups(groupdata) {
        this.provider.groups.import(groupdata, this.errors);
        return this.provider.groups.validGroups;
    }

    validateUsers(userdata) {
        this.provider.users.import(userdata, this.errors);
        return this.provider.users.validUsers;
    }

    validateHosts(hosts) {
        //filter and clean up cloned hosts
        hosts.forEach((hostdef) => {
            try {
                let host = this.provider.hosts.import(hostdef);
                Array.prototype.push.apply(this.errors, this.provider.hosts.errors[host.name]);
            }
            catch (e) {
                    this.errors.push(e.message);
            }
        });
        return this.provider.hosts.validHosts;
    }

    includeSSHConfig(host) {
        var sshConfig = Object.assign({}, this.sshConfigs[host.include_ssh_config]);
        delete host["include_ssh_config"];
        host["ssh"] = sshConfig;
    }

    findValidUser(username, validUsers) {
        if (Array.isArray(validUsers)) {
            return validUsers.find((item) => {
                if (item.name === username) {
                    return item;
                }
            });
        } else {
            this.errors.push(`failed to search for user ${username} - provided validUsers was not defined`);
        }
    }

    findValidGroup(groupname, validGroups) {
        if (Array.isArray(validGroups)) {
            return validGroups.find((item) => {
                if (item.name === groupname) {
                    return item;
                }
            });
        } else {
            this.errors.push(`failed to search for group  ${groupname} - provided validGroups was not defined`);
        }
    }

}

export
default
Controller;
    
