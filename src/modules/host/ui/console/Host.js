/**
 * Created by mark on 2016/04/16.
 */

import HostEntity from '../../Host';
import Vincent from '../../../../Vincent';
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';
import UserAccount from  '../../../user/ui/console/UserAccount';
import logger from '../../../../Logger';

var data = new WeakMap();

class Host extends PermissionsUIManager {

    constructor(host, appUser) {
        //if parameter is of type HostElement (real Host) then we assume it is already
        //added to valid host and this is a reconstruction.
        if (typeof host === 'string') {
            host = new HostEntity(Vincent.app.provider, host, appUser.name, appUser.primaryGroup, 760);
            Vincent.app.provider.managers.hostManager.addHost(host);
        } else if (!host instanceof Host) {
            throw new Error("Host constructor requires a host name or ip address as a string parameter");
        }
        super(appUser, host);
        var obj = {};
        obj.permObj = host;
        obj.appUser = appUser;
        data.set(this, obj);
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
            if (!ra) {
                data.get(this).permObj.remoteAccess = new RemoteAccess("same", remoteAuth);
            } else {
                data.get(this).permObj.remoteAccess.authentication = remoteAuth;
            }
        });
    }

    get remoteSudoAuth() {
        return this._readAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                return false;
            } else {
                return data.get(this).permObj.remoteAccess.sudoAuthentication;
            }
        });
    }

    set remoteSudoAuth(remoteSudoAuth) {
        this._writeAttributeWrapper(()=> {
            let ra = data.get(this).permObj.remoteAccess;
            if (!ra) {
                data.get(this).permObj.remoteAccess = new RemoteAccess("same", "publicKey".remoteSudoAuth);
            } else {
                data.get(this).permObj.remoteAccess.sudoAuthentication = remoteSudoAuth;
            }
        });
    }


    get name() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.name;
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
            return data.get(this).permObj.permissions;
        });
    }

    set permissions(perms) {
        this._writeAttributeWrapper(()=> {
            data.get(this).permObj.permissions = perms;
        });
    }

    // set name(name) {
    //        this._writeAttributeWrapper(()=> {
    //            data.get(this).permObj.name = name;
    //        });
    //}

    inspect() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return {
                    name: data.get(this).permObj.name
                };
            });
        } catch (e) {
            return  "Permission denied"
        }
    }

    toString() {
        Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            return `{ name: ${this.name} }`;
        });
    }

    save(appUser) {
        return Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            let result = Vincent.app.provider.managers.hostManager.saveHost(data.get(this).permObj);
            return result;
        });
    }

    generatePlaybook() {
        return Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            try {
                return Vincent.app.provider.engine.export(data.get(this).permObj).then((result)=> {
                    if (result == "success") {
                        return`Successfully generated playbook for ${data.get(this).permObj.name}.`;
                    }else{
                        resolve(`Failed to generate playbook for ${data.get(this).permObj.name}.`);
                    }
                });
            } catch (e) {
                return `There was an error generating playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`;
            }
        });
    }

    runPlaybookWithDefaultAuth() {
        //username, checkhostkey, privkeyPath, passwd, sudoPasswd
        return Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            try {
                Vincent.app.session.socket.write(`${data.get(this).permObj.name} playbook has been submitted. Results will be available shortly.`);
                let user = Vincent.app.provider.config.get("sshuser");
                let passwd = Vincent.app.provider.config.get("sshpassword");
                Vincent.app.provider.engine.runPlaybook(data.get(this).permObj, undefined, undefined, user, passwd).then((results)=> {
                    return `Results for ${data.get(this).permObj.name}. - ${results}`;
                }).catch((e)=> {
                    return `There was an error running playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`;
                });
            } catch (e) {
                return `There was an error running playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`;
            }
        });
    }

    _readAttributeWrapper(func) {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
        } catch (e) {
            return e.message;
        }
    }

    _writeAttributeWrapper(func) {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
    }

}

export default Host;