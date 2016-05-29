"use strict";

import Host from './Host';
import RemoteAccess from './RemoteAccess';
import Provider from '../../Provider';
import logger from '../../Logger';
import Manager from '../base/Manager';
import fs from 'fs';
import ConsoleHostManager from './ui/console/HostManager';
import path from "path";
import ModuleLoader from '../../utilities/ModuleLoader';


class HostManager extends Manager {

    constructor(provider) {
        if (!provider instanceof Provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validHosts = [];
        this.errors = {
            permObj: []
        };
    }

    exportToEngine(engine, host, struct) {
        //na
    }

    addHost(host) {
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


    findValidHost(vhost) {
        //accommodate Host object or hostname string
        if (typeof vhost === 'string') {
            var hostname = vhost;
        } else if (vhost.name) {
            hostname = vhost.name;
        } else {
            logger.logAndThrow("The host parameter must be of type Host or a host name and must be in validHosts");
        }

        return this.validHosts.find((host)=> {
            if (host.name === hostname) {
                return host;
            }
        });
    }

    loadFromFile() {
        let result = true;
        this.errors.length = 0;
        let dbDir = this.provider.getDBDir();
        //hosts configuration
        let loc = "hosts";
        let hostConfigs = fs.readdirSync(`${dbDir}/${loc}`);
        hostConfigs.forEach((config)=> {
            try {
                let json = this.provider.loadFromFile(`${loc}/${config}`);
                if (json) {
                    //is this a file with many hosts or a single host?
                    if (Array.isArray(json)) {
                        this.loadHosts(json);
                    } else {
                        this.loadFromJson(json);
                    }
                }
            } catch (e) {
                logger.error(`Error loading file for ${config}. Discarding.`);
                result = false;
            }
        });
        return result;
    }

    /**
     Method to provision a host for the specific engine.
     */
    provisionHostForEngine(targetHost) {
        if (typeof targetHost == 'object') {
            if (!targetHost.name) {
                throw new Error("provisioning a host for configu engine  requires the targetHost parameter object to " +
                    "have a name property.");
            }
            //if (!targetHost instanceof Host) {
            //check if it is a valud host and user has access rights to host.
            targetHost = this.findValidHost(targetHost);
            //}
            return this.provider.engine.export(targetHost);
        } else {
            throw new Error("The parameter  host to provisionHostForEngine must be of type Host or " +
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
                    this.errors.permObj);
            }
        });
        return this.validHosts;
    }

    loadHost() {
        //Mo op
    }

    loadFromJson(hostDef) {

        var hostData = {
            name: hostDef.name,
            owner: hostDef.owner,
            group: hostDef.group,
            permissions: hostDef.permissions
        };


        let host = {};

        //create host instance
        try {
            host = new Host(this.provider, hostData);
            this.errors[host.name] = [];
        } catch (e) {
            logger.logAndThrow(`Could not create host ${hostDef.name ? hostDef.name : ""} - ${e.message}`);
        }

        //TODO refactor remote access manager
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
            ModuleLoader.managerOrderedIterator((managerClass)=> {
                let manager = this.provider.getManagerFromClassName(managerClass);
                manager.loadHost(this, host, hostDef);
            }, this.provider);
        } catch (e) {
            logger.logAndAddToErrors(`Error processing updateHost for managers -${e.message ? e.message : e}`,
                this.errors[host.name]);
        }


        //host.source = hostDef;
        this.addHost(host);
        Array.prototype.push.apply(this.errors[host.name], host.errors);
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

    loadConsoleUIForSession(context, appUser) {
        context.hostManager = new ConsoleHostManager(appUser);
    }
    
    static getDependencies() {
        return [];
    }

    saveAll() {
        //todo
    }

    saveHost(host, backup = true) {
        if (!host instanceof Host) {
            logger.logAndThrow("Host parameter must be of type host");
        }
        //check if hosts folder exists and create if not
        try {
            fs.statSync(this.provider.getDBDir() + "/hosts");
        } catch (e) {
            mkdirp(this.provider.getDBDir() + "/hosts");
        }
        return this.provider.saveToFile(`hosts/${host.name}.json`, host, backup);
    }

}

export default HostManager;