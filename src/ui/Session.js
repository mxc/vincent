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

    getProvider() {
            return this[_provider];
    }

}

export default Session;