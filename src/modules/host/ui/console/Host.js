/**
 * Created by mark on 2016/04/16.
 */

import HostEntity from '../../Host';
import Vincent from '../../../../Vincent';
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';
import Session from '../../../../ui/Session';
import RemoteAccess from './RemoteAccess';
import History from './History';

var data = new WeakMap();

class Host extends PermissionsUIManager {

    constructor(host, session, configGroup) {

        if (!(session instanceof Session)) {
            throw new Error("Parameter session must be an instance of Session.");
        }

        if (!(host instanceof HostEntity) && typeof host !== "string") {
            throw new Error("The host parameter must be a host name, or a ui/Host instance.");
        }

        if (!configGroup) {
            configGroup = "default";
        }

        //if parameter is of type HostElement (real Host) then we assume it is already
        //added to valid host and this is a reconstruction.

        if (typeof host === 'string') {
            host = new HostEntity(Vincent.app.provider, host, session.appUser.name,
                session.appUser.primaryGroup, 760, configGroup);
            Vincent.app.provider.managers.hostManager.addHost(host);
        }
        super(session, host);
        var obj = {};
        obj.permObj = host;
        obj.appUser = session.appUser;
        obj.session = session;
        data.set(this, obj);
        this.lastResult = "NA";
        this.info = "Not Available";
    }

    getHistory() {
        return this._readAttributeWrapper(()=> {
            if (data.get(this).history) {
                let hist = new History(data.get(this).history, data.get(this).session, data.get(this).permObj);
                return hist;
            } else {
                let hist;
                try {
                    hist = Vincent.app.provider.managers.hostManager.historyManager.loadFromFile(data.get(this).permObj);
                }catch(e){
                    hist = Vincent.app.provider.managers.hostManager.historyManager.createHistory(data.get(this).permObj);
                }
                data.get(this).history = hist;
                return new History(hist, data.get(this).session, data.get(this).permObj);
            }
        });
    }
    
    get remoteAccess() {
        if (data.get(this).permObj.remoteAccess == undefined) {
            Vincent.app.provider.managers.hostManager.addRemoteAccessToHost(data.get(this).permObj);
        }
        return new RemoteAccess(data.get(this).permObj.remoteAccess);
    }

    getInfo(func) {
        let remoteUsername;
        let privateKeyPath;
        let password;
        let sudoPassword;
        let authType;
        let checkHostKey = Vincent.app.provider.config.get("checkhostkey");
        if (!checkHostKey) {
            checkHostKey = true;
        } else if (!Object.isBoolean(checkHostKey)) {
            checkHostKey = false;
        }

        let host = data.get(this).permObj;
        let cli = data.get(this).session.console;

        //username, checkhostkey, privkeyPath, passwd, sudoPasswd
        return Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, host, ()=> {
            try {
                let out = data.get(this).session.console;
                //If remote access is not defined on the host then use public key
                if (!host.remoteAccess || !host.remoteAccess.authentication || host.remoteAccess.authentication == "publicKey") {
                    privateKeyPath = data.get(this).appUser.privateKeyPath;
                    authType = "publicKey";
                } else {
                    authType = "password";
                    password = data.get(this).session.passwords[host.name];
                    if (!password) {
                        password = data.get(this).session.passwords["default"];
                    }
                    if (!password) {
                        cli.outputError(`Host ${host.name} uses password authentication but no password has been set.\n`
                            + `Please set your password with ".password ${host.name}.`);
                        return;
                    }
                }

                if (!host.remoteAccess.remoteUser) {
                    remoteUsername = appUser.username;
                } else {
                    remoteUsername = host.remoteAccess.remoteUser;
                }

                //determine if there is a SUDO password
                if (host.remoteAccess.sudoAuthentication) {
                    sudoPassword = data.get(this).session.passwords[host.name];
                    if (!sudoPassword) {
                        sudoPassword = data.get(this).session.passwords["default"];
                    }
                }

                if (!func) {
                    func = (result)=> {
                        this.info = result;
                        cli.outputSuccess(`Host ${host.name} query returned. Status available in info property.`);
                    };
                }
                Vincent.app.provider.engine.getInfo(host, checkHostKey, privateKeyPath,
                    remoteUsername, password, sudoPassword).then(func, (err)=> {
                    cli.outputError(`Error during host information retrieval - ${err}`);
                }).catch((e)=> {
                    cli.outputError(`There was an error getting info for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`);
                });
                return `${host.name} info query has been submitted. Results will be available shortly.`;
            } catch (e) {
                cli.outputError(`There was an error configuring execution of info query ${data.get(this).permObj.name} - ${e.message ? e.message : e}`);
            }
        });

    }

    get name() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.name;
        });
    }

    set name(name) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).permObj.name = name;
        });
    }

    get owner() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.owner;
        });
    }

    set owner(owner) {
        this._writeAttributeWrapper(()=> {
            data.get(this).permObj.owner = owner;
        });
    }

    get configGroup() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.configGroup;
        });
    }

    set configGroup(configGroup) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).permObj.configGroup = configGroup;
        });
    }

    get group() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.group;
        });
    }

    set group(group) {
        this._writeAttributeWrapper(()=> {
            data.get(this).permObj.group = group;
        });
    }

    get permissions() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.permissions.toString(8);
        });
    }

    set permissions(perms) {
        this._writeAttributeWrapper(()=> {
            data.get(this).permObj.permissions = perms;
        });
    }

    get osFamily() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.osFamily;
        });
    }

    set osFamily(os) {
        this._writeAttributeWrapper(()=> {
            data.get(this).permObj.osFamily = os;
        });
    }

    inspect() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return {
                    name: data.get(this).permObj.name,
                    configGroup: data.get(this).permObj.configGroup,
                    owner: data.get(this).permObj.owner,
                    group: data.get(this).permObj.group,
                    permissions: data.get(this).permObj.permissions.toString(8),
                    osFamily: data.get(this).permObj.osFamily,
                };
            });
        } catch (e) {
            data.get(this).session.console.outputError(`Permission denied - ${e.message ? e.message : e}`);
        }
    }

    toString() {
        Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            return `{ name: ${this.name} }`;
        });
    }

    save() {
        return Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            let result = Vincent.app.provider.managers.hostManager.saveHost(data.get(this).permObj);
            if(data.get(this).history){
                this.getHistory().save();
            }
            return result;
        });
    }

    generateDeploymentArtifact() {
        data.get(this).session.console.outputSuccess("Generating configuration files for engine. Please wait...");
        Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            try {
                return Vincent.app.provider.engine.export(data.get(this).permObj).then((result)=> {
                    if (result == "success") {
                        data.get(this).session.console.outputSuccess(`Successfully generated playbook for ${data.get(this).permObj.name}.`);
                    } else {
                        data.get(this).session.console.outputWarning(`Failed to generate playbook for ${data.get(this).permObj.name}.`);
                    }
                });
            } catch (e) {
                data.get(this).session.console.outputError(`There was an error generating playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`);
            }
        });
    }

    applyConfig(genDepArtifact = true) {
        let remoteUsername;
        let privateKeyPath;
        let password;
        let sudoPassword;
        let authType;

        if (genDepArtifact) this.generateDeploymentArtifact();

        let checkHostKey = Vincent.app.provider.config.get("checkhostkey");
        if (!checkHostKey) {
            checkHostKey = true;
        } else if (!Object.isBoolean(checkHostKey)) {
            checkHostKey = false;
        }

        let host = data.get(this).permObj;
        let cli = data.get(this).session.console;
        //username, checkhostkey, privkeyPath, passwd, sudoPasswd
        return Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, host, ()=> {
            try {
                //If remote access is not defined on the host then use public key
                if (!host.remoteAccess || !host.remoteAccess.authentication || host.remoteAccess.authentication == "publicKey") {
                    privateKeyPath = data.get(this).appUser.privateKeyPath;
                    authType = "publicKey";
                } else {
                    authType = "password";
                    password = data.get(this).session.passwords[host.name];
                    if (!password) {
                        password = data.get(this).session.passwords["default"];
                    }
                    if (!password) {
                        cli.outputError(`Host ${host.name} uses password authentication but no password has been set.\n`
                            + `Please set your password with ".password ${host.name}.`);
                        return;
                    }
                }

                if (!host.remoteAccess.remoteUser) {
                    remoteUsername = appUser.username;
                } else {
                    remoteUsername = host.remoteAccess.remoteUser;
                }

                //determine if there is a SUDO password
                if (host.remoteAccess.sudoAuthentication) {
                    sudoPassword = data.get(this).session.passwords[host.name];
                    if (!sudoPassword) {
                        sudoPassword = data.get(this).session.passwords["default"];
                    }
                    if (!sudoPassword) {
                        cli.outputError(`Host ${host.name} requires a sudo password but no password has been set.\n`
                            + `Please set your password with ".password ${host.name}.`);
                        return;
                    }
                }

                //try running playbook
                Vincent.app.provider.engine.runPlaybook(host, checkHostKey, privateKeyPath,
                    remoteUsername, password, sudoPassword).then((results)=> {
                    let ts = Date.now();
                    if(!data.get(this).history){
                        this.getHistory();
                    }
                    data.get(this).history.addEntry(ts,results);
                    this.lastResult = data.get(this).history.getEntry(ts);
                    if(this.lastResult.status=="failed"){
                        cli.outputError(`${this.lastResult.entry.stats[host.name].failures} tasks failed for for ${data.get(this).permObj.name}. Please view history for details.`);
                        return;
                    }
                    cli.outputSuccess(`Configuration for ${data.get(this).permObj.name} successfully deployed. Please view history for details.`);
                }).catch((e)=> {
                    cli.outputError(`There was an error running playbook for ${data.get(this).permObj.name} ` +
                        `- ${e.message ? e.message : e}`);
                });
                return `${host.name} playbook has been submitted. Results will be available shortly.`;
            } catch (e) {
                cli.outputError(`There was an error setting up playbook execution for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`);
            }
        });
    }

    get listConfigs() {
        return Object.keys(data.get(this).permObj.configs.container);
    }

    getConfig(key) {
        return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            let obj = data.get(this).permObj.getConfig(key);
            let entries = Vincent.app.converters.entries();
            let converter;
            var entry = entries.next();
            while (!entry.done) {
                if (entry.value[0] === key) {
                    converter = entry.value[1];
                    break;
                }
                entry = entries.next();
            }
            if (!converter) {
                data.get(this).session.console.outputError(`No converter for config ${key} was found.`);
                return;
            }
            return new converter(obj, data.get(this).permObj, data.get(this).session);
        });
    }

    deleteConfig(key) {
        try {
            data.get(this).permObj.removeConfig(key);
            data.get(this).session.console.outputSuccess(`Configuration for ${key} has been removed from host ${this.name}.`);
        } catch (e) {
            data.get(this).session.console.outputError(e.message);
        }
    }

}

export default Host;