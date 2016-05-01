/**
 * Created by mark on 2016/04/16.
 */
import Provider from '../../../../Provider';
import HostElement from '../../Host';
import User from './../../../user/ui/console/User';
import {app} from '../../../../Vincent';


const _host = Symbol("host");
const _appUser = Symbol("appUser");

class Host {

    constructor(host,appUser) {
        //if parameter is of type HostElement (real Host) then we assume it is already
        //added to valid host and this is a reconstruction.
        if (host instanceof HostElement) {
            this[_host] = host;
        } else if(typeof host ==='string') {
            this[_host] = new HostElement(app.provider, host);
            app.provider.managers.hostManager.addHost(this[_host]);
        }else{
            throw new Error("Host constructor requires a host name or ip address as a string parameter");
        }
        this[_appUser] = appUser;
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
        app.provider.managers.hostManager.saveHost(this[_host]);
    }

    generatePlaybook(){
        try {
            app.provider.engine.export(this[_host]);
            console.log(`Successfully generated playbook for ${this[_host].name}.`);
        }catch(e){
            console.log(`There was an error generating playbook for ${this[_host].name} - ${e.message? e.message:e}`);
        }
    }

    runPlaybook(username, checkhostkey, privkeyPath, passwd, sudoPasswd){
        try {
            console.log(`${this[_host].name} playbook has been submitted. Results will be available shortly.`);
            app.provider.engine.runPlaybook(this[_appUser],this[_host],checkhostkey, privkeyPath,
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