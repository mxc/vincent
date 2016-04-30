/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import {app} from '../../../../Vincent';

class HostManager {

    addHost(hostname) {
        if (typeof hostname === 'string') {
            new Host(hostname);
            console.log(`created host ${hostname}`);
        }else{
            console.log("Parameter must be a hostname string");
        }
    }

    list() {
        return app.provider.managers.hostManager.validHosts.map((host=> {
            return host.name;
        }));
    }

    getHost(user,hostname) {
        let host = app.provider.managers.hostManager.findValidHost(hostname);
        if (host && this.provider.checkPermissions(user,host)) {
            return new Host(host);
        } else {
            console.log("Host not found in host list");
            return;
        }
    }

    save(){
        app.provider.textDatastore.saveAll();
        console.log("hosts, users and groups successfully saved");
    }

    saveHost(host){
        let realhost = app.provider.managers.hostManager.findValidHost(host.name);
        app.provider.textDatastore.saveHost(realhost);
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