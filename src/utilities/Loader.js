"use strict";

import Provider from '../Provider';
import User from '../coremodel/User';
import Group from '../coremodel/Group';
import Host from '../coremodel/Host';
import HostUser from '../coremodel/hostcomponents/HostUser';
import HostGroup from '../coremodel/hostcomponents/HostGroup';
import logger from '../Logger';
import fs from 'fs';


class Loader {

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
    import() {
        //reset errors array at beginning of validation
        this.errors.length = 0;
        let dbDir = this.provider.config.get('confdir') + '/db';
        //user configuration
        try {
            let users = JSON.parse(fs.readFileSync(dbDir + '/users.json', 'utf-8'));
            this.loadUsers(users);
        } catch (e) {
            logger.logAndAddToErrors(`Error loading the users config - ${e.message}`, this.errors);
            //if we can't load users we won't be able to load hosts so return
            return false;
        }
        ////group configuration
        try {
            let groups = JSON.parse(fs.readFileSync(dbDir + '/groups.json', 'utf-8'));
            this.loadGroups(groups);
        } catch (e) {
            logger.logAndAddToErrors(`Error loading groups config - ${e.message}`, this.errors);
            //if we can't load groups we probably won't be able to load hosts
            return false;
        }
        ////host configuration
        try {
            let hostConfigs = fs.readdirSync(dbDir + '/hosts');
            hostConfigs.forEach((config)=> {
                let hosts = JSON.parse(fs.readFileSync(dbDir + '/hosts.json', 'utf-8'));
                this.loadHosts(config);
            });
        } catch (e) {
            logger.logAndAddToErrors(`Error loading host config - ${e.message}`, this.errors);
        }

        if (this.errors.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    loadGroups(groupdata) {
        this.provider.groups.import(groupdata, this.errors);
        return this.provider.groups.validGroups;
    }

    loadUsers(userdata) {
        this.provider.users.import(userdata, this.errors);
        return this.provider.users.validUsers;
    }

    loadHosts(hosts) {
        //filter and clean up cloned hosts
        hosts.forEach((hostdef) => {
            try {
                let host = this.provider.hosts.import(hostdef);
                //console.log(this.provider.hosts.errors[host.name]);
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

export default Loader;
    
