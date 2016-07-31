/**
 * Created by mark on 2016/02/19.
 */
import {logger} from '../../Logger';
import Provider from '../../Provider';
import HostSsh from './HostSsh'
import SSH from './Ssh';

import Host from '../host/Host';
import UserManager from '../user/UserManager';
import GroupManager from '../group/GroupManager';
import HostComponentContainer from '../base/HostComponentContainer';
import PermissionsManager from '../base/PermissionsManager';
import HostSshUI from '../ssh/ui/console/HostSsh';
import HostUI from '../host/ui/console/Host';
import SSHManagerUI from './ui/console/SSHManager';
import User from "../user/User";

class SshManager extends PermissionsManager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super(provider);
        this.data = {};
        this.data.configs = {};
        this.provider = provider;
        this.errors = [];
        this.engines = provider.loader.loadEngines('ssh', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    export() {
        var obj = {
            owner: this.owner,
            group: this.group,
            permissions: this.permissions.toString(8),
            configs: []
        };
        Object.keys(this.data.configs).forEach((key)=>{
           obj.configs.push({ name:key, config:this.data.configs[key]});
        });
        return obj;
    }

    addConfig(name, sshConfig) {
       try{
           let ssh = new SSH(sshConfig);
           this.data.configs[name]=ssh.export();
       }catch(e){
           logger.logAndThrow(`Error parsing sshConfig for ${name} - ${e.message}.`);
       }
    }

    removeConfig(name){
        if(this.data.configs[name]){
            delete this.data.configs[name];
        }else{
            logger.logAndThrow(`Config ${name} not found in ssh configs.`);
        }
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
        this.owner = sshconfigsData.owner;
        this.group = sshconfigsData.group;
        this.permissions = sshconfigsData.permissions;
        sshconfigsData.configs.forEach((sshConfig)=> {
            if (!sshConfig.config) {
                logger.logAndAddToErrors("Ssh config data must have a property of type 'config' " +
                    "with a valid config definition", this.errors);
            } else {
                this.addConfig(sshConfig.name,sshConfig.config);
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
        if (hostDef.configs && hostDef.configs.ssh) {
            try {
                this.addSsh(host, hostDef.configs.ssh);
            } catch (e) {
                logger.logAndAddToErrors(`Error adding ssh to host - ${e.message}`,
                    hosts.errors[host.name].get(host.configGroup));
            }
        }
    }

    addSsh(host, config) {

        if (!(host instanceof Host)) {
            logger.logAndThrow(`Parameter host must be an instance of Host.`);
        }

        if (typeof config === 'object') {
            let hostSsh = new HostSsh(this.provider, config);
            host.data.configs.add("ssh", hostSsh);
            return hostSsh;
        } else {
            let configDef = this.findSSHConfig(config);
            if (!configDef) {
                logger.logAndThrow(`Ssh config '${config}' not found.`);
            }
            let hostSsh = new HostSsh(this.provider, configDef);
            host.addConfig("ssh", hostSsh);
            return hostSsh;
        }

    }

    getSsh(host) {
        if (host.data.configs) {
            return host.data.configs.get("ssh");
        }
    }

    save(backup = true) {
        return this.provider.saveToFile("includes/ssh-configs.json", this, backup);
    }

    static getDependencies() {
        return [UserManager, GroupManager];
    }

    loadConsoleUIForSession(context, session) {
        super.loadConsoleUIForSession(context, session);
        if (!HostUI.prototype.addSshConfig) {
            HostUI.prototype.addSshConfig = function (sshConfig) {
                let func = function () {
                    return this.genFuncHelper(function (sshConfig, tsession, permObj) {
                        var hostSsh = new HostSshUI(sshConfig, permObj, tsession);
                        return hostSsh;
                    }, sshConfig);
                };
                func = func.bind(this);
                return this._writeAttributeWrapper(func);
            };
        }
        context.sshManager = new SSHManagerUI(session);
    }

    entityStateChange(ent) {
        //noop
    }

    deleteEntity(ent) {
        //noop
    }

    addValidUser(host, user) {
        if ((user instanceof User || typeof user === "string") && (host instanceof Host)) {
            let ssh = host.getConfig("ssh");
            if (!ssh) {
                throw new Error(`${host.name} does not have a ssh config;`);
            }
            if (!ssh.validUsers) {
                ssh.validUsers = [];
            }

            let ua = this.provider.managers.userManager.findUserAccountForHostByUserName(host, user);
            if (ua) {
                ssh.validUsers.push(ua.name);
                ssh.validUsersOnly=true;
                return ssh.validUsers;
            } else {
                logger.logAndThrow(`User ${user.name ? user.name : user} is not a valid user or does not have a user account on host ${host.name}.`);
            }
        } else {
            logger.logAndThrow("Parameter user must be an instance of User or a username string.");
        }
    }

    removeValidUser(host, user) {
        if ((user instanceof User || typeof user === "string") && (host instanceof Host)) {
            let ssh = host.getConfig("ssh");
            if (!ssh) {
                throw new Error(`${host.name} does not have a ssh config;`);
            }
            if (!this.data.validUsers) {
                return;
            }
            let ua = this.provider.mananager._HostManager.findUserAccountForHostByUserName(host, user);
            if (ua) {
                let index = ssh.validUsers.indexOf(user.name ? user.name : user);
                if (index != -1) {
                    ssh.validUsers.splice(index, 1);
                    if (ss.validUsers.length==0){
                        this.addValidUsersOnly=false;
                    }
                }
                return ssh.validUsers;
            }
        } else {
            logger.logAndThrow("Parameter user must be an instance of User or a username string.");
        }
    }

}

export default SshManager;