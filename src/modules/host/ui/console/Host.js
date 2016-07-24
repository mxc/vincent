/**
 * Created by mark on 2016/04/16.
 */

import HostEntity from '../../Host';
import Vincent from '../../../../Vincent';
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';
import Session from '../../../../ui/Session';
import RemoteAccess from '../../RemoteAccess';
import chalk from 'chalk';

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
        this.lastResults = "NA";
        this.info = "Not Available";
    }

    get remoteUser() {
        return this._readAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                return "currentUser";
            } else {
                return data.get(this).permObj.remoteAccess.remoteUser;
            }
        });
    }

    //to do make engine independent
    updateOSFamily() {
        if (this.info!="Not Available") {
            this.osFamily = this.info.ansible_os_family;
            if (!this.osFamily) {
                this.osFamily = "unknown";
                data.get(this).session.console.outputError("Could not determine Os Family. Please update manually.");
            }
            data.get(this).session.console.outputSuccess(`OS detected as ${this.osFamily}. Host updated.`);
        } else {
            data.get(this).session.console.outputSuccess("Querying host for osFamily. Please be patient.");
            this.getInfo((result)=> {
                this.info = result;
                if (!this.info) {
                    this.info = "failed";
                }
                data.get(this).session.console.outputSuccess("Query successful.");
                this.updateOSFamily();
            });
        }
    }

    set remoteUser(remoteUser) {
        this._writeAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                data.get(this).permObj.remoteAccess = new RemoteAccess(remoteUser);
            } else {
                data.get(this).permObj.remoteAccess.remoteUser = remoteUser;
            }
        });
    }

    get remoteAuth() {
        return this._readAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                return "publicKey";
            } else {
                return data.get(this).permObj.remoteAccess.authentication;
            }
        });
    }

    set remoteAuth(remoteAuth) {
        this._writeAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            try {
                if (!ra) {
                    data.get(this).permObj.remoteAccess = new RemoteAccess("currentUser", remoteAuth);
                } else {
                    data.get(this).permObj.remoteAccess.authentication = remoteAuth;
                }
            } catch (e) {
                data.get(this).session.socket.write(e.message ? e.message : e);
            }
        });
    }

    get remoteSudoAuth(){
        return this._readAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                return false;
            } else {
                return data.get(this).permObj.remoteAccess.sudoAuthentication;
            }
        });
    }

    set remoteSudoAuth(sudoAuth) {
        this._writeAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            try {
                if (!ra) {
                    data.get(this).permObj.remoteAccess = new RemoteAccess("currentUser", "publicKey");
                    data.get(this).permObj.remoteAccess.sudoAuthentication=sudoAuth;
                } else {
                    data.get(this).permObj.remoteAccess.sudoAuthentication = sudoAuth;
                }
            } catch (e) {
                data.get(this).session.socket.write(e.message ? e.message : e);
            }
        });
    }



    get becomeUser() {
        return this._readAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                return false;
            } else {
                return data.get(this).permObj.remoteAccess.becomeUser;
            }
        });
    }

    set becomeUser(becomeUser) {
        this._writeAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            try {
                if (!ra) {
                    data.get(this).permObj.remoteAccess = new RemoteAccess("currentUser", "publicKey", becomeUser);
                } else {
                    data.get(this).permObj.remoteAccess.becomeUser = becomeUser;
                }
            } catch (e) {
                return e.message ? e.message : e;
            }
        });
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
                            + `Please set your password with ".password ${host.name}.${chalk.styles.red.close}`);
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
                        cli.outputSuccess(`Host ${host.name} query successful. Host variables populated.`);
                    };
                }
                Vincent.app.provider.engine.getInfo(host, checkHostKey, privateKeyPath,
                    remoteUsername, password, sudoPassword).then(func, (err)=> {
                    cli.outputError(`Error during host information retrieval - ${err}`);
                }).catch((e)=> {
                    cli.outputError(`There was an error getting info for ${data.get(this).permObj.name} - ${e.message ? e.message : e}${chalk.styles.red.close}`);
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

    get keepSystemUpdated() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.keepSystemUpdated;
        });
    }

    set keepSystemUpdated(enabled) {
        return this._readAttributeWrapper(()=> {
            data.get(this).permObj.keepSystemUpdated = enabled;
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
                    keepSystemUpdated: data.get(this).permObj.keepSystemUpdated
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
                    if(!sudoPassword){
                        cli.outputError(`Host ${host.name} requires a sudo password but no password has been set.\n`
                            + `Please set your password with ".password ${host.name}.`);
                        return;
                    }
                }

                //try running playbook
                Vincent.app.provider.engine.runPlaybook(host, checkHostKey, privateKeyPath,
                    remoteUsername, password, sudoPassword).then((results)=> {
                    this.lastResults = results.toString();
                    cli.outputSuccess(`${chalk.styles.green.open}${this.lastResults}${chalk.styles.green.close}\n`);
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

    // _readAttributeWrapper(func) {
    //     try {
    //         return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
    //     } catch (e) {
    //         return e.message;
    //     }
    // }
    //
    // _writeAttributeWrapper(func) {
    //     return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
    // }

    get listConfigs() {
        return Object.keys(data.get(this).permObj.configs.container);
    }

    getConfig(key) {

        // Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
        //     return `{ name: ${this.name} }`;
        // });
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
        return new converter(obj, this, data.get(this).session);
    }

}

export default Host;