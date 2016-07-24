/**
 * Created by mark on 2016/07/23.
 */

/**
 * Created by mark on 2016/07/17.
 */
import Vincent from '../../../../Vincent';
import HostElement from '../../../host/Host';
import Host from '../../../host/ui/console/Host';
import TaskObject from '../../../../ui/base/TaskObject';
import Session from '../../../../ui/Session';
import {logger} from '../../../../Logger';

var data = new WeakMap();

class HostSSH extends TaskObject {

    constructor(sshConfig, host, session) {

        let obj = {};
        if (!(session instanceof Session)) {
            throw new Error("Parameter session must be of type Session.");
        }
        obj.session = session;
        if (!(host instanceof Host) && !(host instanceof HostElement)) {
            throw new Error("Host SSH creation failed - parameter host not of type console Host or Host.");
        }

        let rHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name, host.configGroup);
        if(!rHost){
            throw new Error(`Host ${host.name} is not valid.`);
            return;
        }
        obj.permObj = rHost;

        let hostSsh = Vincent.app.provider.managers.sshManager.addSsh(rHost, sshConfig);
        obj.data = hostSsh;
        super(session,hostSsh,obj.permObj);
        data.set(this, obj);
    }

    get permitRoot() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).data.permitRoot;
        });
    }

    set permitRoot(permit) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).data.permitRoot = permit;
        });
    }

    get validUsersOnly() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).data.validUsersOnly;
        });
    }

    set validUsersOnly(permit) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).data.validUsersOnly = permit;
        });
    }

    get passwordAuthentication() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).data.passwordAuthentication;
        });
    }

    set passwordAuthentication(permit) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).data.passwordAuthentication = permit;
        });
    }

    get validUsers(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).data.validUsers;
        });
    }

    addValidUser(user){
        return this._readAttributeWrapper(()=>{
            return Vincent.app.provider.managers.sshManager.addValidUser(data.get(this).permObj,user);
        })
    }
    
    removeValidUser(user){
        return this._readAttributeWrapper(()=>{
           return  Vincent.app.provider.managers.sshManager.removeValidUser(data.get(this).permObj,user);
        })       
    }

    inspect(){
        return {
            permitRoot: this.permitRoot,
            passwordAuthentication: this.passwordAuthentication,
            validUsersOnly: this.validUsersOnly,
            validUsers: this.validUsers
        };
    }
    
}

export default HostSSH;