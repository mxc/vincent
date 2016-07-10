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
import _ from 'lodash';


class HostManager extends Manager {

    constructor(provider) {
        if (!provider instanceof Provider) {
            throw new Error("Parameter provider must be an instance of provider");
        }
        super();
        this.provider = provider;
        this.validHosts =[];
        this.errors = {manager: []};
    }

    exportToEngine(engine, host, struct) {
        //na
    }

    addHost(host) {
        if (host instanceof Host) {
            if (this.validHosts.find((cHost)=> {
                    if (cHost.name === host.name && cHost.configGroup===host.configGroup) {
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


    findValidHost(vhost,configGroup) {
        //accommodate Host object or hostname string
        if (typeof vhost === 'string') {
            var hostname = vhost;
        } else if (vhost instanceof Host) {
            hostname = vhost.name;
            configGroup = vhost.configGroup;
        } else {
            logger.logAndThrow("The host parameter must be of type Host or a host name and must be in validHosts");
        }

        if (configGroup){
            return this.validHosts.find((host)=>{
                if(host.name===hostname && host.configGroup===configGroup){
                    return host;
                }
            });
        } else {
            return this.validHosts.filter((host)=> {
                return host.name === hostname;
            });
        }
    }

    loadFromFile() {
        let configGroups = this.provider.getConfigGroups();
        if (!configGroups) {
            return;
        }
        let result = true;
        configGroups.forEach((configGroup)=> {
            this.errors.length = 0;
            let dbDir = this.provider.getDBDir();
            //hosts configuration
            let hostConfigs = fs.readdirSync(`${dbDir}/configs/${configGroup}`);
            hostConfigs.forEach((host)=> {
                try {
                    let json = this.provider.loadFromFile(`configs/${configGroup}/${host}`);
                    if (json) {
                        //is this a file with many hosts or a single host?
                        if (Array.isArray(json)) {
                            this.loadHosts(json);
                        } else {
                            this.loadFromJson(json);
                        }
                    }
                } catch (e) {
                    logger.error(`Error loading file for ${host} in ${configGroup}. Discarding.`);
                    result = false;
                }
            });
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
        //load hosts
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

    loadHost() {
        //Mo op
    }

    loadFromJson(hostDef) {

        var hostData = {
            name: hostDef.name,
            owner: hostDef.owner,
            group: hostDef.group,
            permissions: hostDef.permissions,
            remoteAccess: hostDef.remoteAccess,
            configGroup: hostDef.configGroup
        };

        let host = {};

        //create host instance
        try {
            host = new Host(this.provider, hostData);
            this.errors[host.name] = new Map();
            this.errors[host.name].set(host.configGroup,[]);
        } catch (e) {
            logger.logAndThrow(`Could not create host ${hostDef.name ? hostDef.name : ""} - ${e.message}`);
        }

        try {
            ModuleLoader.managerOrderedIterator((managerClass)=> {
                let manager = this.provider.getManagerFromClassName(managerClass);
                manager.loadHost(this, host, hostDef);
            }, this.provider);
        } catch (e) {
            logger.logAndAddToErrors(`Error processing loadHost for managers -${e.message ? e.message : e}`,
                this.errors[host.name].get(host.configGroup));
        }

        this.addHost(host);
        Array.prototype.push.apply(this.errors[host.name].get(host.configGroup), host.errors);
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

    loadConsoleUIForSession(context, session) {
        context.hostManager = new ConsoleHostManager(session);
    }

    static getDependencies() {
        return [];
    }

    getConfigs() {
        return this.provider.getConfigGroups();
    }

    createConfig(config) {
        provider.createConfigGroup(config);
    }

    saveAll() {
        //todo
    }

    saveHost(host, backup = true) {
        let config = host.configGroup;
        if (!host instanceof Host) {
            logger.logAndThrow("Host parameter must be of type host");
        }
        //check if hosts folder exists and create if not
        try {
            fs.statSync(this.provider.getDBDir() + `/configs/${config}`);
        } catch (e) {
            mkdirp(this.provider.getDBDir() + `/configs/${config}`);
        }
        return this.provider.saveToFile(`configs/${config}/${host.name}.json`, host, backup);
    }

}

export default HostManager;