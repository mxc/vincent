/**
 * Created by mark on 2016/04/16.
 */

import logger from '../Logger';
import Provider from '../Provider';

const _provider = Symbol("provider");

class Session {

    constructor(provider) {
        if (!provider || !provider instanceof Provider){
            throw new Error("The constructor expects a parameter of type Provider");
        }
        this.authenticated = false;
        this.roles = [];
        this.username = 'guest';
        this[_provider]=provider;
    }

    login(username, password) {
        if(this.isAuthenticated()){
            logger.logandThrow("user is already authenticated");
        }
        //dummy place holder
        if (username === 'mark' && password === "mark") {
            this.authenticated = true;
            this.roles.push("admin");
        }
    }


    logout(){
        this.roles.empty();
        this.authenticated=false;
        this.username='guest';
    }

    isAuthenticated() {
        return this.authenticated;
    }

    getProvider(){
        return this[_provider];
    }
}

export default Session;