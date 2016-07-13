/**
 * Created by mark on 4/2/16.
 */

import Provider from './../../Provider';
import Host from '../host/Host';
import User from '../user/User';
import logger from '../../Logger';

class HostComponent {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be of type provider.");
        } else {
            this.provider = provider;
        }
        this.data={};
        this.data.become=false;
    }

    get becomeUser() {
        return this.data.becomeUser;
    }


    set becomeUser(becomeUser) {
        if (!becomeUser) {
            this.data.becomeUser=null;
        } else if (typeof becomeUser === 'string') {
            this.data.becomeUser = becomeUser;
        }else if (becomeUser instanceof User){
            this.data.becomeUser = user.name;
        } else {
            logger.logAndThrow(`becomeUser must be a username or a User instance. Current value is ` +
                `${becomeUser}.`);
        }
    }

    get become(){
        return this.data.become;
    }

    set become(become){
        if(typeof become ==="boolean"){
            this.data.become=become;
        }else{
            logger.logAndThrow(`become must be a boolean.`);
        }
    }

    export(child){
        if (this.data.become){
            child.become=this.data.become;
        }
        if (this.data.becomeUser){
            child.becomeUser= this.data.becomeUser;
        }
    }

    load(data){
        if(data.become!== undefined){
            this.become=data.become;
        }
        if(data.becomeUser){
            this.becomeUser = data.becomeUser;
        }
    }

}

export default HostComponent;