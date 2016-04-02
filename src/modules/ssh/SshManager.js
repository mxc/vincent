/**
 * Created by mark on 2016/02/19.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import HostSsh from '../ssh/HostSsh'
import ModuleLoader from '../../utilities/ModuleLoader';

class SshManager extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this._state = "not loaded";
        this.data = {};
        this.data.configs = {};
        this.provider = provider;
        this.errors = [];
        this.engines = ModuleLoader.loadEngines('ssh',provider);
    }

    initialiseHost(host) {

    }

    exportToEngine(engine,host,struct){
        this.engines[engine].exportToEngine(host,struct);
    }

    add(sshConfig) {
        //todo
    }

    get state() {
        return this._state;
    }

    get configs() {
        return this.data.configs;
    }

    loadFromFile() {
        return new Promise((resolve, reject)=> {
                this.provider.loadFromFile("includes/ssh-configs.json").then(data=> {
                    this.loadFromJson(data);
                    resolve("success");
                }).catch(e=> {
                    console.log(e);
                    logger.logAndAddToErrors(`could not load ssh-configs.json file - ${e.message}`, this.errors);
                    reject(e);
                });
            });
    }

    loadFromJson(sshconfigsData) {
            sshconfigsData.forEach((sshconfig)=> {
                if (!sshconfig.config) {
                    logger.logAndAddToErrors("Ssh config data must have a property of type 'config' " +
                        "with a valid config definition", this.errors);
                } else {
                    this.data.configs[sshconfig.name] = sshconfig.config;
                    this._state = "loaded";
                }
            });
    }

    find(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }

    updateHost(hosts, host, hostDef) {
        //Configure hostSsh for host if configured
        if (hostDef.ssh) {
            try {
                this.addSsh(host, hostDef.ssh);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding ssh to host - ${e.message}`,
                    hosts.errors[host.name]);
            }
        } else if (hostDef.includes) {
            let ssh = hosts.findIncludeInDef("ssh", hostDef.includes);
            if (ssh) {
                this.addSsh(host,ssh);
            }
        }
    }

    addSsh(host, config) {
        if (typeof config === 'object') {
            host.data.hostSsh = new HostSsh(this.provider, config);
            host.data.hostSsh.host = host;
            host._export.ssh = host.data.hostSsh.data.export();
        } else {
            let configDef = this.find(config);
            if (!configDef) {
                throw new Error(`Ssh config '${config}' not found.`);
            }
            host.data.hostSsh = new HostSsh(this.provider, configDef);
            host.data.hostSsh.host = host;
            host.checkIncludes();
            host._export.includes["ssh"] = config;
        }
    }

    getSsh(host) {
        if (host.data.hostSsh) {
            return host.data.hostSsh.ssh;
        }
    }


}

export default SshManager;