/**
 * Created by mark on 2016/07/24.
 */

import AnsibleEngineComponent from '../../../engines/AnsibleEngineComponent';
import Debian from '../Debian';
import Redhat from '../Redhat';

class AnsibleEngine extends AnsibleEngineComponent{

    constructor(provider) {
        super(provider);
        this.provider = provider;
    }


    exportToEngine(host,tasks){
        let t, sysUpdate;
        try {
            sysUpdate = host.getConfig("systemUpdate");
        }catch(e){
            return;
        }
        if(sysUpdate instanceof Debian){
            if(host.osFamily.toLowerCase()==="debian"){
               t={
                    name: "Perform system update",
                    apt: `update_cache=${sysUpdate.updateCache}  upgrade=${sysUpdate.upgrade} autoremote = ${sysUpdate.autoremove}`
                };
            }
        }else if (sysUpdate instanceof Redhat){
            if (host.osFamily.toLowerCase()=="redhat") {
                t = {
                    name: "Perform system update",
                    yum: `name=* state=latest update_cache=yes`
                };
            }
        }
        this.appendBecomes(host,sysUpdate,t);
        tasks.push(t);

    }
}

export default AnsibleEngine;
