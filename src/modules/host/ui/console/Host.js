/**
 * Created by mark on 2016/04/16.
 */

import HostEntity from '../../Host';
import User from './../../../user/ui/console/User';
import Vincent from '../../../../Vincent';
import Permissions from '../../../../ui/PermissionsUIManager';

const _host = Symbol("host");
const _appUser = Symbol("appUser");

class Host extends Permissions {

    constructor(host, appUser) {
        //if parameter is of type HostElement (real Host) then we assume it is already
        //added to valid host and this is a reconstruction.
        super();
        if (host instanceof HostEntity) {
            this[_host] = host;
        } else if (typeof host === 'string') {
            this[_host] = new HostEntity(Vincent.app.provider, host, appUser.name, appUser.primaryGroup, 760);
            Vincent.app.provider.managers.hostManager.addHost(this[_host]);
        } else {
            throw new Error("Host constructor requires a host name or ip address as a string parameter");
        }
        this[_appUser] = appUser;
    }

    get owner(){
        return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], ()=> {
            return this[_host].owner;
        });
    }

    get group(){
        return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], ()=> {
            return this[_host].group;
        });
    }

    get permissions(){
        return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], ()=> {
            return this[_host].permissions;
        });
    }

    get name() {
        return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], ()=> {
            return this[_host].name;
        });
    }

    set name(name) {
        Vincent.app.provider._writeAttributeCheck(this[_appUser], this[_host], ()=> {
            this[_host].name = name;
        });
    }

    set owner(owner) {
        Vincent.app.provider._writeAttributeCheck(this[_appUser], this[_host], ()=> {
            this[_host].owner = owner;
        });
    }

    set group(group) {
        Vincent.app.provider._writeAttributeCheck(this[_appUser], this[_host], ()=> {
            this[_host].group = group;
        });
    }

    set permissions(permissions) {
        Vincent.app.provider._writeAttributeCheck(this[_appUser], this[_host], ()=> {
            this[_host].permissions = permissions;
        });
    }



    inspect() {
        return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], ()=> {
            return {
                name: this[_host].name
            };
        });
    }

    toString() {
        Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], ()=> {
            return `{ name: ${this.name} }`;
        });
    }

    save(appUser) {
        Vincent.app.provider._executeAttributeCheck(this[_appUser], this[_host], ()=> {
            Vincent.app.provider.managers.hostManager.saveHost(this[_host]);
        });
    }

    generatePlaybook() {
        Vincent.app.provider._executeAttributeCheck(this[_appUser], this[_host], ()=> {
            try {
                Vincent.app.provider.engine.export(this[_host]).then((resolve)=> {
                    console.log(`Successfully generated playbook for ${this[_host].name}.`);
                });
            } catch (e) {
                console.log(`There was an error generating playbook for ${this[_host].name} - ${e.message ? e.message : e}`);
            }
        });
    }

    runPlaybook(username, checkhostkey, privkeyPath, passwd, sudoPasswd) {
        Vincent.app.provider._executeAttributeCheck(this[_appUser], this[_host], ()=> {
            try {
                console.log(`${this[_host].name} playbook has been submitted. Results will be available shortly.`);
                Vincent.app.provider.engine.runPlaybook(this[_host], checkhostkey, privkeyPath,
                    username, passwd, sudoPasswd).then((results)=> {
                    console.log(`Results for ${this[_host].name}. - ${results}`);
                }).catch((e)=> {
                    console.log(`There was an error running playbook for ${this[_host].name} - ${e.message ? e.message : e}`);
                });
            } catch (e) {
                console.log(`There was an error running playbook for ${this[_host].name} - ${e.message ? e.message : e}`);
            }
        });
    }

}

export default Host;