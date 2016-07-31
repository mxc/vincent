import {logger} from '../../Logger';
import Host from '../host/Host';
import HostManager from '../host/HostManager';

class Base {

    get listOsFamilies() {
        return {
            debian: "debian",
            redhat: "redhat",
            unknown: "unknown"
        }
    }

    isKnownOsFamily(family){
        let regex = /[Dd]ebian|[Rr]edhat/;
        return regex.test(family);
    }

    isHostInstance(host) {
        if (!(host instanceof Host)) {
            logger.logAndThrow("Parameter host must be an instance of Host.");
        }
    }

    getValidHostFromHostParameter(hostManager,host,configGroup){
        if(!(hostManager instanceof HostManager)){
            logger.logAndThrow("Parameter hostManager must be an instance of HostManager.");
        }
        if(!(host.name && host.configGroup) && (typeof host !="string" || typeof configGroup!="string")){
            logger.logAndThrow("Parameter host must be an instance of Host or a host name string.");
        }
        if(!configGroup){
            return hostManager.findValidHost(host);
        }else if(configGroup){
            return hostManager.findValidHost(host,configGroup);
        }
    }

    getBooleanValue(val) {

        let vtrue = /yes|true/;
        let vfalse = /no|false/;
        if (val == undefined) {
            return false;
        }
        if (typeof val === 'string') {
            val = val.toLowerCase();
            if (vtrue.test(val)) {
                return true;
            } else if (vfalse.test(val)) {
                return false;
            } else {
                throw new Error("Boolean value must be 'true/yes' or 'false/no'");
            }
        } else if (typeof val == 'boolean') {
            return val;
        } else  throw new Error("Boolean value must be 'true/yes' or 'false/no'");
    }

    idToJSON() {
        return '{ "name":' + this.data.name + ',' + '"state:"' + this.data.state + '}';
    }


}

var base = new Base();

export default base;