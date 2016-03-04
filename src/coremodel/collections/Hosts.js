"use strict";

import Host from './../Host';
import HostUser from '../hostcomponents/HostUser';
import HostGroup from '../hostcomponents/HostGroup';
import RemoteAccess from '../hostcomponents/RemoteAccess';
import SudoEntry from '../SudoEntry';
import Provider from './../../Provider';
import logger from './../../Logger';

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
            if (this.validHosts.find((cHost)=>{
                        if (cHost.name===host.name){
                            return cHost;
                        }
                })){
                //todo Merge hosts?
                throw new Error("Host already exists in model");
            }else {
                this.validHosts.push(host);
            }
        } else {
            logger.logAndThrow("Parameter host must be of type Host");
        }
    }

    find(hostname) {
        return this.validHosts.find((host)=> {
            if (host.name === hostname) {
                return host;
            }
        });
    }

    provisionHostForEngine(initHost){
        if (typeof initHost =='object'){
            if(!initHost.name){
                throw new Error("Initialising a new host requires the initHost object to " +
                    "have a name property.");
            }
            if(!initHost instanceof Host) {
               initHost=this.provider.hosts.load(initHost);
            }
            let playbook = this.provider.engine.loadEngineDefinition(initHost);
            this.provider.engine.export(playbook);
            //this.provider.database.initHost(host.name).then();
        }else{
            throw new Error("The parameter to init host must be of type Host or " +
                "an HostDef object");
        }
    }

    load(hostDef) {
        var hostData = {
            name: hostDef.name
        };
        let host = {};

        //create host instance
        try {
            host = new Host(this.provider, hostData);
            this.errors[host.name] = [];
        } catch (e) {
            logger.logAndThrow(`Error adding host - ${e.message}`);
        }

        //Configure hostSsh for host if configured
        if (hostDef.ssh) {
            try {
                host.addSsh(hostDef.ssh);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding ssh to host - ${e.message}`,
                    this.errors[host.name]);
            }
        } else if (hostDef.includes) {
            let ssh = this.findIncludeInDef("ssh", hostDef.includes);
            if (ssh) {
                host.addSsh(ssh);
            }
        }

        //configure remoteAccess settings for host.
        if(hostDef.remoteAccess){
            try {
                let remoteAccessDef = hostDef.remoteAccess;
                let remoteAccess = new RemoteAccess(remoteAccessDef.remoteUser,
                    remoteAccessDef.authentication, remoteAccessDef.sudoAuthentication);
                host.setRemoteAccess(remoteAccess);
            }catch(e){
                logger.logAndAddToErrors(`Error adding remote access user - ${e.message}`,
                    this.errors[host.name]);
            }
        }

        //add users to host
        if (hostDef.users) {
            hostDef.users.forEach(
                (userDef) => {
                    try {
                        var hostUser = new HostUser(host.provider, userDef);
                        host.addHostUser(hostUser);
                        Array.prototype.push.apply(
                            this.errors[host.name],
                            hostUser.errors);
                    }
                    catch (e) {
                        logger.logAndAddToErrors(`Error adding host user - ${e.message}`,
                            this.errors[host.name]);
                    }
                });
        }

        //Add user categories into the user array
        if (hostDef.includes) {
            let userCategories = this.findIncludeInDef("userCategories", hostDef.includes);
            if (userCategories) {
                userCategories.forEach((userCategory) => {
                    try {
                        host.addUserCategory(userCategory);
                    } catch (e) {
                        this.errors[host.name].push(e.message);
                    }
                });
            }
        }

        //group and group membership validation
        if (hostDef.groups) {
            hostDef.groups.forEach((groupdef) => {
                try {
                    let hostGroup = new HostGroup(host.provider, groupdef);
                    host.addHostGroup(hostGroup);
                    Array.prototype.push.apply(this.errors[host.name], hostGroup.errors);
                } catch (e) {
                    logger.logAndAddToErrors(`Error adding host group - ${e.message}`,
                        this.errors[host.name]);
                }
            });
        }

        //Add group categories into the groups array
        if (hostDef.includes) {
            let groupCategories = this.findIncludeInDef("groupCategories", hostDef.includes);
            if (groupCategories) {
                groupCategories.forEach((groupCategory) => {
                    try {
                        host.addGroupCategory(groupCategory);
                    } catch (e) {
                        this.errors[host.name].push(e.message);
                    }
                });
            }
        }

        if (hostDef.sudoerEntries) {
                hostDef.sudoerEntries.forEach((sudoEntryData)=> {
                    try {
                        host.addSudoEntry(sudoEntryData);
                    } catch (e) {
                        this.errors[host.name].push(e.message);
                    }
                });
        }

        if (hostDef.includes) {
            let sudoerEntries = this.findIncludeInDef("sudoerEntries", hostDef.includes);
            if (sudoerEntries) {
                sudoerEntries.forEach((sudoEntry) => {
                    try {
                        host.addSudoEntry(sudoEntry);
                    } catch (e) {
                        this.errors[host.name].push(e.message);
                    }
                });
            }
        }

        host.source = hostDef;
        this.add(host);
        Array.prototype.push.apply(this.errors[host.name], host.errors)
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

    findIncludeInDef(name, includes) {
        let inc = includes[name];
        if (inc) {
            return inc;
        } else {
            return;
        }
    }
}

export default Hosts;