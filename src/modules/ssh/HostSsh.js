/**
 * Created by mark on 2016/02/19.
 */

import HostComponent from './../base/HostComponent';
import Ssh from './Ssh';

class HostSsh extends HostComponent {

    constructor(provider,config) {
        super(provider);
        this.data=new Ssh(config);
        super.load(config);
        this.errors = this.data.errors;
    }

    get ssh(){
        return this.data.data;
    }

    export(){
        let  obj = this.data.export();
        super.export(obj);
        return obj;
    }

}

export default HostSsh;