/**
 * Created by mark on 2016/07/25.
 */

import HostUI from '../../../../host/ui/console/Host';
import Vincent from '../../../../../Vincent';
import SystemUpdate from './SystemUpdate';

var data = new WeakMap();

class SystemUpdateManager{

    constructor(session) {
        let obj={};
        obj.session = session;
        data.set(this,obj);
        Vincent.app.converters.set("systemUpdate",SystemUpdate);
    }

    addSystemUpdateConfig(host){
        if (host instanceof HostUI){
            try {
                let vHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name,host.configGroup);
                let sysUpdate= Vincent.app.provider.managers.systemUpdateManager.addSystemUpdateToHost(vHost);
                if(sysUpdate){
                    return new SystemUpdate(sysUpdate,vHost,data.get(this).session);
                }
            }catch(e){
                data.get(this).session.console.outputError(e.message);
            }
        } else{
            data.get(this).session.console.outputError("Parameter host must be of type Host.")
        }
    }

    inspect(){
        return  'A manager for managing software updates.'
    }

}

export default SystemUpdateManager;