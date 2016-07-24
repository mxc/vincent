/**
 * Created by mark on 2016/07/24.
 */

import AnsibleEngineComponent from '../../engines/AnsibleEngineComponent';

class AnsibleEngine extends AnsibleEngineComponent{

    constructor(provider) {
        super(provider);
        this.provider = provider;
    }


    exportToEngine(host,tasks){
        let t;
        if(host.keepSystemUpdated){
            if(host.osFamily.toLowerCase()==="debian"){
               t={
                    name: "Perform system update",
                    apt: `update_cache=yes  upgrade=yes`
                };
            }
        }else if (host.osFamily.toLowerCase()=="redhat"){
            t={
                name: "Perform system update",
                yum: `name=* state=latest update_cache=yes`
            };
        }
        this.appendBecomes(host,{become:true},t);
        tasks.push(t);
    }
}

export default AnsibleEngine;
