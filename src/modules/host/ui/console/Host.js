/**
 * Created by mark on 2016/04/16.
 */

import HostEntity from '../../Host';
import Vincent from '../../../../Vincent';
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';

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

    get name() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).permObj.name;
        });
    }

    set name(name) {
        this._writeAttributeWrapper(()=> {
            data.get(this).permObj.name = name;
        });
    }

    inspect() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return {
                    name: data.get(this).permObj.name
                };
            });
        } catch (e) {
            return {
                msg: "Permission denied"
            }
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
              return  Vincent.app.provider.engine.export(data.get(this).permObj).then((resolve)=> {
                    console.log(`Successfully generated playbook for ${data.get(this).permObj.name}.`);
                });
            } catch (e) {
                return `There was an error generating playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`;
            }
        });
    }

    runPlaybook(username, checkhostkey, privkeyPath, passwd, sudoPasswd) {
        Vincent.app.provider._executeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            try {
                console.log(`${this[_host].name} playbook has been submitted. Results will be available shortly.`);
                Vincent.app.provider.engine.runPlaybook(this[_host], checkhostkey, privkeyPath,
                    username, passwd, sudoPasswd).then((results)=> {
                    console.log(`Results for ${data.get(this).permObj.name}. - ${results}`);
                }).catch((e)=> {
                    console.log(`There was an error running playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`);
                });
            } catch (e) {
                console.log(`There was an error running playbook for ${data.get(this).permObj.name} - ${e.message ? e.message : e}`);
            }
        });
    }

}

export default Host;