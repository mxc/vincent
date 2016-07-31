/**
 * Created by mark on 2016/07/27.
 */

import Session from '../../../../../ui/Session';
import HostEntity from '../../../../host/Host';
import Debian from '../../Debian';
import Redhat from '../../Redhat';
import TaskObject from '../../../../../ui/base/TaskObject';

var data = new WeakMap();

class SystemUpdate extends TaskObject{

    constructor(systemUpdate,host, session) {
        if (!(session instanceof Session)) {
            throw new Error("Parameter session must be an instance of Session.");
        }

        if (!(host instanceof HostEntity) && typeof host !== "string") {
            throw new Error("The host parameter must be a host name, or a ui/Host instance.");
        }
        let obj={};
        obj.permObj=host;
        obj.session=session;
        obj.systemUpdate = systemUpdate;
        super(session,systemUpdate, host);
        data.set(this,obj);
        
        if(systemUpdate instanceof Debian){
                Object.defineProperty(this,"autoremove",{
                    get: ()=>{
                        return this._readAttributeWrapper(()=> {
                            return data.get(this).systemUpdate.autoremove;
                        });
                    },
                    set: ()=>{
                        this._writeAttributeWrapper((autoremove)=> {
                            data.get(this).systemUpdate.autoremove = autoremove;
                        });
                    },
                    enumerable:true
                });
        }else if(systemUpdate instanceof Redhat){

        }
    }

    get upgrade(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).systemUpdate.upgrade;
        });
    }

    get updateCache(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).systemUpdate.updateCache;
        });
    }

    set upgrade(upgrade){
        this._writeAttributeWrapper(()=> {
            data.get(this).systemUpdate.ugrade = upgrade;
        });
    }

    set updateCache(updateCache){
        this._writeAttributeWrapper(()=> {
            data.get(this).systemUpdate.updateCache = updateCache;
        });
    }

    inspect() {
        let obj = {
            upgrade: data.get(this).systemUpdate.upgrade,
            updateCache: data.get(this).systemUpdate.updateCache
        };
        if (this instanceof Debian) {
            obj.autoremove = data.get(this).systemUpdate.autoremove
        }
        return obj;
    }
}


export default SystemUpdate;