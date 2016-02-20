"use strict";

import Host from './Host';
import HostUser from './HostUser';
import HostGroup from './HostGroup';
import Provider from './Provider';
import logger from './Logger';

class Hosts {

    constructor(provider) {
        if (!provider instanceof Provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        this.provider = provider;
        this.validHosts = [];
        this.errors = {};
    }

    add(host) {
        if (host instanceof Host) {
            this.validHosts.push(host);
            //var tmpGroup = this.findGroupByName(group.name);
            //if (tmpGroup) {
            //    if (tmpGroup.gid !== group.gid) {
            //        logger.logAndThrow(`Group ${group.name} already exists with different group id`);
            //    } else {
            //        logger.logAndThrow(`Group ${group.name} already exists.`)
            //    }
            //} else {
            //    tmpGroup = group.gid ? this.findGroupByGid(group.gid) : undefined;
            //    if (tmpGroup) {
            //        logger.logAndThrow(`Group ${group.name} with gid ${group.gid} already exists as ${tmpGroup.name} with gid ${tmpGroup.gid}.`);
            //    } else {
            //        this.validGroups.push(group);
            //    }
            //}
        } else {
            logger.logAndThrow("Parameter host must be of type Host");
        }
    }

    find(hostname){
        return this.validHosts.find((host)=>{
            if (host.name===hostname){
                return host;
            }
        });
    }

    import(hostdef) {
        var hostdata = {
            name: hostdef.name
        };
        let host = {};

        //create host instance
        try {
            host = new Host(this.provider, hostdata);
            this.errors[host.name] = [];
        } catch (e) {
            logger.logAndThrow(`Error adding host - ${e.message}`);
        }

        //Configure ssh for host if configured
        if (hostdef.ssh) {
            try {
                host.addSsh(hostdef.ssh);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding ssh to host - ${e.message}`,
                    this.errors[host.name]);
            }
        } else if (hostdef.includes) {
            let ssh = this.findInclude("ssh",hostdef.includes)
            if (ssh) {
                host.addSsh(ssh);
            }
        }


        //Add user categories into the user array
        if (hostdef.includes) {
            let userCategories = this.findInclude("userCategories",hostdef.includes);
            if(userCategories){
                userCategories.forEach((userCategory) => {
                    try {
                        host.addUserCategory(userCategory);
                    }catch(e){
                        this.errors[host.name].push(e.message);
                    }
                });
            }
        }

        //add users to host
        if (hostdef.users) {
            hostdef.users.forEach(
                (userdef) => {
                    try {
                        var hostuser = new HostUser(host, userdef);
                        host.addHostUser(hostuser);

                        Array.prototype.push.apply(
                            this.errors[host.name],
                            hostuser.errors);
                    }
                    catch (e) {
                        logger.logAndAddToErrors(`Error adding host user - ${e.message}`,
                            this.errors[host.name]);
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
        if (hostdef.groups) {
            hostdef.groups.forEach((groupdef) => {
                try {
                    var hostgroup = new HostGroup(host, groupdef);
                    host.addHostGroup(hostgroup);
                    Array.prototype.push.apply(this.errors[host.name], hostgroup.errors);
                } catch (e) {
                    logger.logAndAddToErrors(`Error adding host group - ${e.message}`,
                        this.errors[host.name]);
                }
            });
        }
        host.source = hostdef;
        this.add(host);
        return host;
    }

    export() {
        var obj = [];
        this.validHosts.forEach((host)=> {
            obj.push(host.export());
        });
        return obj;
    }

    clear() {
        this.validHosts = [];
    }

    findInclude(name,includes){
        includes.find((include)=> {
            if (include[name]) {
                return include[name];
            }
        });
    }
}


export default Hosts;