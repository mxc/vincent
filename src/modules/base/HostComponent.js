/**
 * Created by mark on 2016/02/20.
 */
import Provider from './../../Provider';
import Host from '../host/Host';

class HostComponent {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be of type provider.");
        } else {
            this.provider = provider;
        }
    }

    set host(host){
        if( !(host instanceof Host)){
            throw new Error("Parameter host must be of type Host.");
        }
        if(this.provider===host.provider) {
            this._host = host;
        }else{
            throw new Error("The host provider and the objects provider must be the same object");
        }
    }

    get host(){
        return this._host;
    }

}

export default HostComponent;