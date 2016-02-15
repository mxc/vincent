/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import Base from './Base';

class Ssh extends Base {

    constructor(data) {
        super();
        this.data = {
            permitroot: no,
            validusersonly: no,
            passwordauthentication: yes
        };
        if (typeof data === 'string') {
            switch (data) {
                case "strict":
                    this.data.permitroot = "no";
                    this.data.passwordauthentication = "no";
                    this.data.validusersonly = "yes";
                    break;
                case "strictwithroot":
                    this.data.permitroot = "without-password";
                    this.data.passwordauthentication = "no";
                    this.data.validusersonly = "yes";
                    break;
                case "insecure":
                    this.data.permitroot = "yes";
                    this.data.passwordauthentication = "no";
                    this.data.validusersonly = "yes";
                    break;
            }
        } else if (typeof data === 'object') {
            if (data.permitroot)  this.data.permitroot = data.permitroot;
            if (data.validusersonly)  this.data.validusersonly = data.validusersonly;
            if (data.passwordauthentication)  this.data.passwordauthentication = data.passwordauthentication;
        } else {
            throw new Error("Data must be a config identifier or a custom config object");
        }
    }

    set permitroot(val) {
            this.data.permitroot=this.getBooleanValue(val);
    }

    get permitroot() {
        return this.data.permitroot;
    }

    set validusersonly(val) {
        this.data.permitroot=this.getBooleanValue(val);
    }

    get validusersonly() {
        return this.data.validusersonly;
    }

    set passwordAuthentication(val) {
        this.data.permitroot=this.getBooleanValue(val);
    }

    get passwordAuthentication() {
        return this.data.passwordauthentication;
    }

}