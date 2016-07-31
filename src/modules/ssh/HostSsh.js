/**
 * Created by mark on 2016/02/19.
 */

import HostComponent from './../base/HostComponent';
import Ssh from './Ssh';
import {logger} from '../../Logger';
import Host from '../host/Host';
import User from '../user/User';
class HostSsh extends HostComponent {

    constructor(provider, config) {
        super(provider,config);
        this.data.obj = new Ssh(config);
        this._validUsers = [];
        this.errors = this.data.errors;
    }

    get permitRoot() {
        return this.data.obj.permitRoot;
    }

    set permitRoot(root) {
        this.data.obj.permitRoot = root;
    }

    get validUsersOnly() {
        return this.data.obj.validUsersOnly;
    }

    set validUsersOnly(permit) {
        this.data.obj.validUsersOnly = permit;
    }

    get passwordAuthentication() {
        return this.data.obj.passwordAuthentication;
    }

    set passwordAuthentication(permit) {
        this.data.obj.passwordAuthentication = permit;
    }
    
    get validUsers(){
        return this._validUsers;
    }


    export() {
        let obj = this.data.obj.export();
        if (this.validUsers.length > 0) obj.validUsers = this.validUsers;
        super.export(obj);
        return obj;
    }

}

export default HostSsh;