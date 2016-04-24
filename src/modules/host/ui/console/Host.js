/**
 * Created by mark on 2016/04/16.
 */
import Provider from '../../../../Provider';
import HostElement from '../../Host';
import User from './../../../user/ui/console/User';
import {session} from '../../../../Main';


const _host = Symbol("host");

class Host {

    constructor(host) {
        //if parameter is of type HostElement (real Host) then we assume it is already
        //added to valid host and this is a reconstruction.
        if (host instanceof HostElement) {
            this[_host] = host;
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
        session.getProvider().managers.hostManager.saveHost(this[_host]);
    }

    generatePlaybook(){
        try {
            session.getProvider().engine.export(this[_host]);
            console.log(`Successfully generated playbook for ${this[_host].name}.`);
        }catch(e){
            console.log(`There was an error generating playbook for ${this[_host].name} - ${e.message? e.message:e}`);
        }
    }

    runPlaybook(username, checkhostkey, privkeyPath, passwd, sudoPasswd){
        try {
            console.log(`${this[_host].name} playbook has been submitted. Results will be available shortly.`);
            session.getProvider().engine.runPlaybook(this[_host],checkhostkey, privkeyPath,
                username, passwd, sudoPasswd).then((results)=> {
                console.log(`Results for ${this[_host].name}. - ${results}`);
            }).catch((e)=>{
                console.log(`There was an error running playbook for ${this[_host].name} - ${e.message? e.message:e}`);
            });
        }catch(e){
            console.log(`There was an error running playbook for ${this[_host].name} - ${e.message? e.message:e}`);
        }
    }

}

export default Host;