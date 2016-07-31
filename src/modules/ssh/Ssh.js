/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import base from './../base/Base';
import {logger} from './../../Logger';
import HostSsh from './ui/console/HostSsh';

class Ssh  {

    constructor(data) {
        this.data = {
            permitRoot: false,
            validUsersOnly: true,
            passwordAuthentication: false
        };
        this.errors = [];
        if (typeof data == 'object') {
            if (data.permitRoot!==undefined) {
                if (data.permitRoot=="without-password"){
                    this.data.permitRoot=data.permitRoot;
                }else {
                    this.data.permitRoot = base.getBooleanValue(data.permitRoot);
                }
            } else {
                logger.logAndAddToErrors("Ssh object is missing permitroot key. Using default",this.errors);
            }
            if (data.validUsersOnly!==undefined) {
                this.data.validUsersOnly = base.getBooleanValue(data.validUsersOnly);
            } else {
                logger.logAndAddToErrors("Ssh object is missing validuseronly key. Using default",this.errors);
            }
            if (data.passwordAuthentication!==undefined) {
                this.data.passwordAuthentication = base.getBooleanValue(data.passwordAuthentication);
            } else {
                logger.logAndAddToErrors("Ssh object is missing passwordAuthentication key. Using default",this.errors);
            }
        } else {
            throw new Error("The data parameter to Ssh must be an object");
        }
    }
    
    set permitRoot(val) {
        this.data.permitRoot = base.getBooleanValue(val);
    }

    get permitRoot() {
        return this.data.permitRoot;
    }

    set validUsersOnly(val) {
        this.data.validUsersOnly = base.getBooleanValue(val);
    }

    get validUsersOnly() {
        return this.data.validUsersOnly;
    }

    set passwordAuthentication(val) {
        this.data.passwordAuthentication = base.getBooleanValue(val);
    }

    get passwordAuthentication() {
        return this.data.passwordAuthentication;
    }

    export() {
        return this.data;
    }
    
    toString(){
        return `permitRoot:${this.data.permitRoot}, passwordAuthentication:${this.data.passwordAuthentication}, validUsersOnly:${this.data.validUsersOnly}`;
    }
}

export default Ssh;