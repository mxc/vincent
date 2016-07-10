/**
 * Created by mark on 2016/02/19.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import HostSsh from '../ssh/HostSsh'
import Host from '../host/Host';
import ModuleLoader from '../../utilities/ModuleLoader';
import UserManager from '../user/UserManager';
import GroupManager from '../group/GroupManager';
import HostComponentContainer from '../base/HostComponentContainer';

class SshManager extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
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
        if (hostDef.config && hostDef.config.ssh) {
            try {
                this.addSsh(host, hostDef.config.ssh);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding ssh to host - ${e.message}`,
                    hosts.errors[host.name].get(host.config));
            }
        }
    }

    addSsh(host, config) {

        if(!host instanceof Host){
            logger.logAndThrow(`Parameter host must be an instance of Host.`);
        }

        if (!host.data.config){
            host.data.config = new HostComponentContainer("config");
        }

        if (typeof config === 'object') {
            host.data.config.add("ssh",new HostSsh(this.provider, config));
        } else {
            let configDef = this.findSSHConfig(config);
            if (!configDef) {
                logger.logAndThrow(`Ssh config '${config}' not found.`);
            }
            host.data.config.add("ssh",new HostSsh(this.provider, configDef));
        }
    }

    getSsh(host) {
        if (host.data.config) {
            return host.data.config.get("ssh");
        }
    }

    static getDependencies(){
        return [UserManager,GroupManager];
    }

    loadConsoleUIForSession(context,session) {
        //no op
    }

}

export default SshManager;