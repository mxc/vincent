/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import Vincent from '../../../../Vincent';
import logger from '../../../../Logger';

const _appUser = Symbol("appUser");
const _manager = Symbol("manager");


class HostManager {

    constructor(appUser) {
        this[_appUser] = appUser;
        this[_manager] = Vincent.app.provider.managers.hostManager;
    }

    addHost(hostname) {
        if (typeof hostname === 'string') {
            var host = new Host(hostname, this[_appUser]);
            console.log(`created host ${hostname}`);
            return host;
        } else {
            console.log("Parameter must be a hostname string");
        }
    }

    list() {
        let tmpList = this[_manager].validHosts.filter((host=> {
            try {
                return Vincent.app.provider._readAttributeCheck(this[_appUser], host, ()=> {
                    return true
                });
            } catch (e) {
                return false;
            }
        }));
        return tmpList.map((host)=> {
            return new Host(host, this[_appUser]);
        });
    }

    getHost(hostname) {
        try {
            let host = this[_manager].findValidHost(hostname);
            return Vincent.app.provider._readAttributeCheck(this[_appUser], host, () => {
                return new Host(host, this[_appUser]);
            });
        } catch (e) {
            console.log(e.message);
            return false;
        }
    }

    saveHosts() {
        console.log("saving hosts");
        let counter = 0;
        this[_manager].validHosts.forEach((host)=> {
            if (this.saveHost(host)) {
                counter++;
            }
        });
        return counter;
    }

    saveHost(host) {
        try {
            if (typeof host === 'string') {
                var realhost = this[_manager].findValidHost(host);
            } else {
                realhost = host;
            }
            return Vincent.app.provider._writeAttributeCheck(this[_appUser], realhost, () => {
                return this[_manager].saveHost(realhost);
                console.log(`host ${realhost.name} successfully saved`);
            });
        }catch(e){
            console.log(e);
            return false;
        }
    }

    generatePlaybooks() {
        let counter = 0;
        let promises = [];
        this.list().forEach((host)=> {
            try {
                promises.push(host.generatePlaybook().then((result)=> {
                    counter++;
                }));
            } catch (e) {
                logger.warn(`playbook generation failed for ${host.name}`);
            }
        });
        return Promise.all(promises).then(()=> {
            console.log(`Successfully generated ${counter} playbooks.`);
            return counter;
        });
    }

}

export default HostManager;