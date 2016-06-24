/**
 * Created by mark on 4/2/16.
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

    // get host(){
    //     return this._host;
    // }
    //
    // isInclude(){
    //     return this.includeLabel ? true: false;
    // }

}

export default HostComponent;