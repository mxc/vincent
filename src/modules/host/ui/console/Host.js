/**
 * Created by mark on 2016/04/16.
 */
import Provider from '../../../../Provider';
import HostElement from '../../Host';
import User from './../../../user/ui/console/User';
import {session} from '../../../../Index';


const _host = Symbol("host");

class Host {

    constructor(host) {
        //if parameter is of type HostElement (real Host) then we assume it is already
        //added to valid host and this is a reconstruction.
        if (host instanceof HostElement) {
            this[_host] = new HostElement(session.getProvider(), host);
        } else if(typeof host ==='string') {
            this[_host] = new HostElement(session.getProvider(), host);
            session.getProvider().managers.hostManager.addHost(this[_host]);
        }else{
            throw new Error("Host constructor requires a host name or ip address as a string parameter");
        }
    }

    get name() {
        return this[_host].name;
    }

    set name(name) {
        this[_host].name = name;
    }

    inspect(){
        return {
            name: this.name,
        };
    }

    toString(){
        return `{ name: ${this.name} }`;
    }

    save(){
        session.getProvider().textDatastore.saveHost(this[_host]);
    }

}

export default Host;