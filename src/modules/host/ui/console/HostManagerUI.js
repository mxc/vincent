/**
 * Created by mark on 2016/04/16.
 */
import HostUI from './HostUI';
import Provider from '../../../../Provider';
import Vincent from '../../../../Vincent';
import logger from '../../../../Logger';
const _appUser = Symbol("appUser");

class HostManagerUI {


    constructor(appUser) {
        this[_appUser] = appUser;
    }

    addHost(hostname) {
        if (typeof hostname === 'string') {
            var host = new HostUI(hostname, this[_appUser]);
            console.log(`created host ${hostname}`);
            return host;
        } else {
            console.log("Parameter must be a hostname string");
        }
    }

    list() {
        let tmpList = Vincent.app.provider.managers.hostManager.validHosts.filter((host=> {
            try {
                return Vincent.app.provider._readAttributeCheck(this[_appUser], host, ()=> {
                    return true
                });
            } catch (e) {
                return false;
            }
        }));
        return tmpList.map((host)=> {
            return new HostUI(host, this[_appUser]);
        });
    }

    getHost(hostname) {
        let host = Vincent.app.provider.managers.hostManager.findValidHost(hostname);
        return Vincent.app.provider._readAttributeCheck(this[_appUser], host, () => {
            return new HostUI(host, this[_appUser]);
        });
    }

    saveHosts() {
        console.log("saving hosts");
        Vincent.app.provider.managers.hostManager.validHosts.forEach((host)=> {
            this.saveHost(host);
        });
    }

    saveHost(host) {
        if (typeof host === 'string') {
            var realhost = Vincent.app.provider.managers.hostManager.findValidHost(host);
        } else {
            realhost = host;
        }
        return Vincent.app.provider._writeAttributeCheck(this[_appUser], realhost, () => {
           return Vincent.app.provider.managers.hostManager.saveHost(realhost);
            console.log(`host ${realhost.name} successfully saved`);
        });
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

export default HostManagerUI;