"use strict";

import Host from './Host';
import RemoteAccess from './RemoteAccess';
import Provider from '../../Provider';
import logger from '../../Logger';
import Manager from '../base/Manager';
import fs from 'fs';

class HostManager extends Manager {

    constructor(provider) {
        if (!provider instanceof Provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validHosts = [];
        this.errors = {
            manager: []
        };
    }

    exportToEngine(engine,host,struct){
        //na
    }
    
    add(host) {
        if (host instanceof Host) {
            if (this.validHosts.find((cHost)=> {
                    if (cHost.name === host.name) {
                        return cHost;
                    }
                })) {
                //todo Merge hosts?
                throw new Error("Host already exists in model");
            } else {
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

    loadFromFile() {
        this.errors.length = 0;
        let dbDir = this.provider.config.get('confdir') + '/db';
        //hosts configuration
        let promises = [];
        fs.readdir(dbDir + '/hosts', (err, hostConfigs)=> {
            hostConfigs.forEach((config)=> {
                promises.push(new Promise(resolve=> {
                    this.provider.loadFromFile(`host/${config}`).then(data=> {
                        this.loadFromJson(data);
                        resolve("success");
                    });
                }));
            });
        });
        return Promise.all(promises);
    }

    /*
     Method to provision a host for the specific engine.
     */
    provisionHostForEngine(targetHost) {
        if (typeof targetHost == 'object') {
            if (!targetHost.name) {
                throw new Error("Initialising a new host requires the initHost object to " +
                    "have a name property.");
            }
            if (!targetHost instanceof Host) {
                targetHost = this.provider.managers.hostManager.load(targetHost);
            }
            let playbook = this.provider.engine.loadEngineDefinition(targetHost);
            this.provider.engine.export(playbook);
            //this.provider.database.initHost(host.name).then();
        } else {
            throw new Error("The parameter to init host must be of type Host or " +
                "an HostComponent object");
        }
    }

    loadHosts(hosts) {
        //filter and clean up cloned hosts
        hosts.forEach((hostDef) => {
            try {
                let host = this.loadFromJson(hostDef);
            }
            catch (e) {
                logger.logAndAddToErrors(`Error loading host - ${e.message}`,
                    this.errors.manager);
            }
        });
        return this.validHosts;
    }

    loadFromJson(hostDef) {

        var hostData = {
            name: hostDef.name
        };

        let host = {};

        //create host instance
        try {
            host = new Host(this.provider, hostData);
            this.errors[host.name] = [];
        } catch (e) {
            logger.logAndThrow(e.message);
        }

        //configure remoteAccess settings for host.
        if (hostDef.remoteAccess) {
            try {
                let remoteAccessDef = hostDef.remoteAccess;
                let remoteAccess = new RemoteAccess(remoteAccessDef.remoteUser,
                    remoteAccessDef.authentication, remoteAccessDef.sudoAuthentication);
                host.setRemoteAccess(remoteAccess);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding remote access user - ${e.message}`,
                    this.errors[host.name]);
            }
        }

        try {
            this.provider.managers.userManager.updateHost(this, host, hostDef);
        } catch (e) {
            logger.logAndAddToErrors(`Error loading users - ${e.message}`,
                this.errors[host.name]);
        }

        try {
            this.provider.managers.groupManager.updateHost(this, host, hostDef);
        } catch (e) {
            logger.logAndAddToErrors(`Error loading groups - ${e.message}`,
                this.errors[host.name]);
        }

        try {
            this.provider.managers.sshManager.updateHost(this, host, hostDef);
        } catch (e) {
            console.log(e);
            logger.logAndAddToErrors(`Error loading ssh - ${e.message}`,
                this.errors[host.name]);
        }

        try {
            this.provider.managers.sudoManager.updateHost(this, host, hostDef);
        } catch (e) {
            logger.logAndAddToErrors(`Error loading ssh - ${e.message}`,
                this.errors[host.name]);
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

export default HostManager;