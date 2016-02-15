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

    setSSHConfigs(sshConfigs) {
        if (!sshConfigs) {
            sshConfigs = JSON.parse(fs.readFileSync(this.config.confdir + 'includes/ssh-configs.js'));
        }
        this.sshConfigs = sshConfigs;
    }

    setUserCategories(userCategories) {
        if (!userCategories) {
            userCategories = JSON.parse(fs.readFileSync(this.config.confdir + 'includes/user-categories.js'));
        }
        this.userCategories = userCategories;
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

    validateGroups(groupsdata) {
        groupsdata.forEach((data) => {
            try {
                var group = new Group(data);
                this.provider.groups.add(group);
            } catch (e) {
                logger.logAndAddToErrors(`Error validating group. ${e.message}`, this.errors);
            }
        });
        return this.provider.groups.validGroups;
    }

    validateUsers(userdata) {
        userdata.forEach((data) => {
            try {
                var user = new User(data);
                this.provider.users.add(user);
            } catch (e) {
                logger.logAndAddToErrors(`Error validating user. ${e.message}`, this.errors);
            }
        });
        return this.provider.users.validUsers;
    }

    validateHosts(hosts) {

        //filter and clean up cloned hosts
        hosts.forEach((hostdef) => {
            var hostdata = {
                name: hostdef.name
            };
            try {
                var host = new Host(this.provider, hostdata);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding host - ${e.message}`, this.errors);
                return;
            }

            ////replace any ssh includes with config
            //if (hostdef.include_ssh_config) {
            //    host.addSSHConfig(hostdef.include_ssh_config);
            //}
            //
            ////Merge user categories into the user array
            //if (hostdef.include_user_categories) {
            //    hostdef.include_user_categories.forEach((userCategory) => {
            //        var categoryUsers = users.userCategories[userCategory];
            //        categoryUsers.forEach((userdef)=> {
            //            host.addUserByName(userdefuser);
            //        });
            //    });
            //}

            //user validation
            if (hostdef.users) {
                hostdef.users.forEach((userdef) => {
                    try {
                        //console.log("iterating over hosts current1 = " + JSON.stringify(userdef));
                        var hostuser = new HostUser(this.provider, userdef);
                        this.errors = this.errors.concat(hostuser.errors);
                        //console.log("iterating over hosts current2 = " + JSON.stringify(hostuser));
                        host.addHostUser(hostuser);
                    } catch (e) {
                        logger.logAndAddToErrors(`Error adding host user - ${e.message}`, this.errors);
                    }
                });
            }
            ////Merge group categories into the user array
            //if (host.include_group_categories) {
            //    host.include_group_categories.forEach((groupcategory) => {
            //        var categoryGroups = this.groupCategories[groupcategory];
            //        if (categoryGroups) {
            //            categoryGroups.forEach((group)=> {
            //                host.groups.push(group);
            //            });
            //        } else {
            //            this.errors.push(`The group category ${groupcategory}  for host ${host} is not defined`);
            //        }
            //    });
            //    delete host["include_group_categories"];
            //}

            //group and group membership validation
            if(hostdef.groups) {
                hostdef.groups.forEach((groupdef) => {
                    try {
                        var hostgroup = new HostGroup(this.provider, groupdef);
                        host.addHostGroup(hostgroup);
                        this.errors = this.errors.concat(hostgroup.errors);
                    } catch (e) {
                        logger.logAndAddToErrors(`Error adding host group - ${e.message}`, this.errors);
                    }
                });
            }
            this.provider.hosts.add(host);
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

    validGroupsToJSON() {
        //console.log(this.provider.groups.validGroups);
        return this.provider.groups.toJSON();
    }

    validUsersToJSON() {
        return this.provider.users.toJSON();
    }

    validHostsToJSON() {
        return this.provider.hosts.toJSON();
    }


}

export default Controller;
    
