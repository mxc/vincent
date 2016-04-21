/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import {session} from '../../../../Index';

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
        return session.getProvider().managers.hostManager.validHosts.map((host=> {
            return host.name;
        }));
    }

    getHost(hostname) {
        let host = session.getProvider().managers.hostManager.findValidHost(hostname);
        if (host) {
            return new Host(host);
        } else {
            console.log("Host not found in host list");
            return;
        }
    }

    save(){
        session.getProvider().textDatastore.saveAll();
        console.log("hosts, users and groups successfully saved");
    }

    saveHost(host){
        let realhost = session.getProvider().managers.hostManager.findValidHost(host.name);
        session.getProvider().textDatastore.saveHost(realhost);
        console.log("host successfully saved");
    }

}

export default HostManager;