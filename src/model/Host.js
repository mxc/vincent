'use strict';

import Group from './Group';
import HostGroup from './HostGroup';
import HostUser from './HostUser';
import HostSsh from './HostSsh';
import Provider from './Provider';
import logger from './Logger';
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

    addUserByName(username) {
        if (typeof username === 'string') {
            var user = this.provider.users.findUserByName(username);
            if (user) {
                if (this.findHostUserByName(username)) {
                    logger.logAndThrow("User ${user.name} already exists on host.");
                } else {
                    this.data.users.push(user);
                }
            } else {
                logger.logAndThrow("User ${username} was not found in the valid users list.");
            }
        } else {
            logger.logAndThrow("The parameter user must be a username.");
        }
    }

    findHostUserByName(username){
        this.data.users.find((huser)=> {
            if (huser.user.equals(username)) {
                return huser;
            }
        });
    }

    addHostUser(hostuser) {
        if (hostuser instanceof HostUser) {
            if (this.provider.users.findUser(hostuser.user)) {
                var foundhostuser = this.findHostUser(hostuser);
                if (foundhostuser) {
                    logger.info("User ${user.name} already exists on host,merging authorized_keys.");
                    this.mergeUser(foundhostuser, hostuser);
                } else {
                    this.data.users.push(hostuser);
                    this._export.users.push(hostuser.export());
                }
            } else {
                logger.logAndThrow("User ${user.name} was not found in the valid users list.");
            }
        } else {
            logger.logAndThrow("The parameter hostuser must be of type HostUser.");
        }
    }

    mergeUsers(existinguser, newuser) {
        this.existinguser.merge(newuser);
        this._export.users.find((user, index)=> {
            if (user.name = existinguser.name) {
                this._export.users.splice(index, 1);
                this._export.users.push(existinguser);
                return existinguser;
            }
        });
    }

    findHostUser(hostuser) {
        this.data.users.find((huser)=> {
            if (huser.user.equals(hostuser.user)) {
                return huser;
            }
        });
    }

    addHostGroup(hostgroup) {
        if (hostgroup instanceof HostGroup) {
            if (this.provider.groups.findGroup(hostgroup.group)) {
                var foundhostgroup = this.findHostGroup(hostgroup);
                if (foundhostgroup) {
                    logger.info("Group ${group.name} already exists on host.");
                    this.mergeGroup(foundhostgroup, hostgroup);
                } else {
                    this.data.groups.push(hostgroup);
                    this._export.groups.push(hostgroup.export());
                }
            } else {
                logger.logAndThrow("Group ${group.name} was not found in the valid groups list.");
            }
        } else {
            logger.logAndThrow("The parameter group must be of type HostGroup.");
        }
    }

    mergeGroup(existinggroup, newgroup) {
        existinggroup.merge(newgroup);
        this._export.groups.find((group, index)=> {
            if (group.name = existinguser.name) {
                this._export.groups.splice(index, 1);
                this._export.groups.push(existinguser._export);
                return existinggroup;
            }
        });
    }

    findHostGroup(hostgroup) {
        this.data.groups.find((hgroup)=> {
            if (hgroup.group.equals(hostgroup.group)) {
                return hgroup;
            }
        });
    }

    addUserCategory(userCategory) {
        let users = this.provider.userCategories.find(userCategory);
        if (users) {
            this._export.includes["userCategories"].push(userCategory);
            let errors = [];
            users.forEach((user)=> {
                try {
                    this.addUserByName(new HostUser(this,user));
                } catch (e) {
                    logger.warn(`Warning adding user category: ${e.message}`);
                    errors.push(`Error adding ${user} from user category ${userCategory} - ${e.message}`);
                }
            });
        }else{
            logger.logAndThrow("UserCategory ${userCategory} does not exist.");
        }
    }

    addSsh(config) {
        if (typeof config === 'object') {
            this.data.ssh = new HostSsh(this, config);
            this._export.ssh = this.data.ssh.data.export();
        } else {
            this.data.ssh = new HostSsh(this, this.provider.sshconfigs.find(config));
            if (!this._export.includes) {
                this._export.includes = [];
            }
            this._export.includes.push({ssh: config});
        }
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