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
        super(provider);
        this.data = new Ssh(config);
        super.load(this.data);
        this._validUsers = [];
        super.load(config);
        this.errors = this.data.errors;
    }

    get permitRoot() {
        return this.data.permitRoot;
    }

    set permitRoot(root) {
        this.data.permitRoot = root;
    }

    get validUsersOnly() {
        return this.data.validUsersOnly;
    }

    set validUsersOnly(permit) {
        this.data.validUsersOnly = permit;
    }

    get passwordAuthentication() {
        return this.data.passwordAuthentication;
    }

    set passwordAuthentication(permit) {
        this.data.passwordAuthentication = permit;
    }
    
    get validUsers(){
        return this._validUsers;
    }


    export() {
        let obj = this.data.export();
        if (this.validUsers.length > 0) obj.validUsers = this.validUsers;
        super.export(obj);
        return obj;
    }

}

export default HostSsh;