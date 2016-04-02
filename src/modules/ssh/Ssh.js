/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import Base from './../base/Base';
import logger from './../../Logger';

class Ssh extends Base {

    constructor(data) {
        super();
        this.data = {
            permitRoot: false,
            validUsersOnly: true,
            passwordAuthentication: false
        };
        this.errors = [];
        if (typeof data === 'object') {
            if (data.permitroot) {
                this.data.permitroot = this.getBooleanValue(data.permitroot);
            } else {
                logger.logAndAddToErrors("Ssh object is missing permitroot key. Using default",this.errors);
            }
            if (data.validusersonly) {
                this.data.validusersonly = this.getBooleanValue(data.validusersonly);
            } else {
                logger.logAndAddToErrors("Ssh object is missing validuseronly key. Using default",this.errors);
            }
            if (data.passwordAuthentication) {
                this.data.passwordAuthentication = this.getBooleanValue(data.passwordAuthentication);
            } else {
                logger.logAndAddToErrors("Ssh object is missing passwordAuthentication key. Using default",this.errors);
            }
        } else {
            throw new Error("The data parameter to Ssh must be an object");
        }
    }

    set permitRoot(val) {
        this.data.permitroot = this.getBooleanValue(val);
    }

    get permitRoot() {
        return this.data.permitroot;
    }

    set validUsersOnly(val) {
        this.data.permitroot = this.getBooleanValue(val);
    }

    get validUsersOnly() {
        return this.data.validusersonly;
    }

    set passwordAuthentication(val) {
        this.data.permitroot = this.getBooleanValue(val);
    }

    get passwordAuthentication() {
        return this.data.passwordauthentication;
    }

    export() {
        return this.data;
    }
}

export default Ssh;