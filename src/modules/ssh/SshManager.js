/**
 * Created by mark on 2016/02/19.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import HostSsh from '../ssh/HostSsh'
import ModuleLoader from '../../utilities/ModuleLoader';
import UserManager from '../user/UserManager';
import GroupManager from '../group/GroupManager';

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


    exportToEngine(engine,host,struct){
        this.engines[engine].exportToEngine(host,struct);
    }

    addSshConfig(sshConfig) {
        //todo
    }

    get state() {
        return this._state;
    }

    get configs() {
        return this.data.configs;
    }

    loadFromFile() {
        if (this.provider.fileExists("includes/ssh-configs.json")) {
            let loc = "includes/ssh-configs.json";
            let data = this.provider.loadFromFile(loc);
            if (data) {
                return this.loadFromJson(data);
            }
        } else {
            logger.warn("Could not load includes/ssh-configs.json. File not found");
        }
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

    findSSHConfig(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }

    loadHost(hosts, host, hostDef) {
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
            let configDef = this.findSSHConfig(config);
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

    static getDependencies(){
        return [UserManager,GroupManager];
    }

    loadConsoleUIForSession(context,appUser) {
        //no op
    }

}

export default SshManager;