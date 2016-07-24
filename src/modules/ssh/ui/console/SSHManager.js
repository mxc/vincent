/**
 * Created by mark on 2016/07/17.
 */
import Vincent from '../../../../Vincent';
import {logger} from '../../../../Logger';
import PermissionHelper from '../../../../ui/base/PermissionHelper';
import HostSsh from './HostSsh';

var data = new WeakMap();

class SSHManager extends PermissionHelper {

    constructor(session){
        super(session);
        let obj = {};
        obj.session = session;
        data.set(this, obj);
        Vincent.app.converters.set("ssh",HostSsh);
    }
    
    get list() {
        let configs = new Map();
        let keys = Object.keys(Vincent.app.provider.managers.sshManager.configs);
        keys.forEach((config)=>{
            configs.set(config,JSON.stringify(Vincent.app.provider.managers.sshManager.configs[config]));
        });
        return configs;
    }
    
}

export default SSHManager;