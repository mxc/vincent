/**
 * Created by mark on 2016/02/19.
 */

import HostDef from './../../modules/base/HostDef';
import Ssh from './../Ssh';

class HostSsh extends HostDef {

    constructor(provider,config) {
        super(provider);
        this.data=new Ssh(config);
        this.errors = this.data.errors;
    }

    get ssh(){
        return this.data.data;
    }


}

export default HostSsh;