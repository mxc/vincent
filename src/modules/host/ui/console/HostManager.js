/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import {app} from '../../../../Vincent';
const _appUser = Symbol("appUser");

class HostManager {

    
    constructor(appUser){
        this[_appUser] = appUser;
    }

    addHost(hostname) {
        if (typeof hostname === 'string') {
            let host = new Host(hostname,this[_appUser]);
            console.log(`created host ${hostname}`);
            return host;
        }else{
            console.log("Parameter must be a hostname string");
        }
    }

    list() {
        return app.provider.managers.hostManager.validHosts.map((host=> {
            return host.name;
        }));
    }

    getHost(hostname) {
        let host = app.provider.managers.hostManager.findValidHost(hostname,this[_appUser]);
        if (host && this.provider.checkPermissions(this[_appUser],host,"r")) {
            return new Host(host,this[_appUser]);
        } else {
            console.log("Host not found in host list");
            return;
        }
    }

    save(){
        app.provider.managers.hostManager.saveAll();
        console.log("hosts, users and groups successfully saved");
    }

    saveHost(host){
        let realhost = app.provider.managers.hostManager.findValidHost(host.name,this[_appUser]);
        app.provider.managers.hostManager.saveHost(realhost);
        console.log("host successfully saved");
    }


    generatePlaybooks(){
        try {
            app.provider.engine.export();
            console.log("Successfully generated playbooks.");
        }catch(e){
            console.log(`There was an error generating playbooks - ${e.message? e.message:e}`);
        }
    }

    generatePlaybook(host){
        try {
            app.provider.engine.export(host);
            console.log(`Successfully generated playbook for ${host.name? host.name :host}.`);
        }catch(e){
            console.log(`There was an error generating playbook for ${host.name? host.name :host}`);
        }
    }
}

export default HostManager;