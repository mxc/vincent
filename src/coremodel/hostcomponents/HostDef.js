/**
 * Created by mark on 2016/02/20.
 */
import Provider from './../../Provider';
import Host from './../Host';
import logger from './../../Logger';

class HostDef {

    constructor(host) {
        if (!host || !(host instanceof Host)) {
            throw new Error("Parameter host must be of type Host.");
        } else {
            this.host = host;
        }

        if (!host.provider || !(host.provider instanceof Provider)) {
            throw new Error("Parameter provider must be provided for HostGroup.")
        }else{
            this.provider = host.provider;
        }
    }

}

export default HostDef;