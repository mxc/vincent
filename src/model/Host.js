'use strict';

import Group from './Group';
import HostGroup from './HostGroup';
import HostUser from './HostUser';
import Provider from './Provider';
import logger from './Logger';

class Host {

    constructor(provider,data) {
        if (!provider || !provider instanceof Provider){
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
                name: data
            };
        }

        if (!data.name) {
            logger.logAndThrow(`The parameter data must be a hostname or an object with a mandatory property \"name\".`);
        }
        this.data = {
            name: data.name,
            users: [],
            groups: [],
        };
    }


    get users() {
        return this.data.users;
    }

    get groups() {
        return this.data.groups;
    }

    addUserByName(username) {
        if (typeof username === 'string') {
            var user = this.provider.users.findUserByName(username);
            if (user) {
                if (this.findHostUserByName(username)) {
                    logger.warn("User ${user.name} already exists on host.");
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

    addHostUser(hostuser) {
        //var t = JSON.stringify(hostuser);
        if (hostuser instanceof HostUser) {
            if (this.provider.users.findUser(hostuser.user)) {
                var foundhostuser = this.findHostUser(hostuser);
                //console.log(`Pushing found (merge) user ${t}`);
                if (foundhostuser) {
                    logger.info("User ${user.name} already exists on host,merging authorized_keys.");
                    foundhostuser.merge(hostuser);
                } else {
                    //console.log(`Pushing user not found ${hostuser.user.name}`);
                    this.data.users.push(hostuser);
                }
            } else {
                logger.logAndThrow("User ${user.name} was not found in the valid users list.");
            }
        } else {
            logger.logAndThrow("The parameter hostuser must be of type HostUser.");
        }
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
                    foundhostgroup.merge(hostgroup);
                } else {
                    this.data.groups.push(hostgroup);
                }
            } else {
                logger.logAndThrow("Group ${group.name} was not found in the valid groups list.");
            }
        } else {
            logger.logAndThrow("The parameter group must be of type HostGroup.");
        }
    }

    findHostGroup(hostgroup) {
        this.data.groups.find((hgroup)=> {
            if (hgroup.group.equals(hostgroup.group)) {
                return hgroup;
            }
        });
    }

    toJSON() {
        var str = '{"name": "' + this.data.name + '",';
        str += '"users": [';

        this.data.users.forEach((hostuser, huindex)=> {
            str += hostuser.toJSON();
            if (huindex != this.users.length - 1) {
                str += ",";
            }
        });
        str += '], "groups": [';

        this.data.groups.forEach((hostgroup, hgindex)=> {
            str += hostgroup.toJSON();
            if (hgindex != this.groups.length - 1) {
                str += ",";
            }
        });
        str += ']}';
        return str;
    }
}

export default Host;