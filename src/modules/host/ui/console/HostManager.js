/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import Vincent from '../../../../Vincent';
import {logger} from '../../../../Logger';
import HostEntity from '../../Host';
import Session from '../../../../ui/Session';

var data = new WeakMap();


class HostManager {

    constructor(session) {
        if(!(session instanceof Session)){
            throw new Error("Parameter sessions must be an instance of Session.");
        }
        let obj = {};
        obj.appUser = session.appUser;
        obj.session = session;
        obj.permObj = Vincent.app.provider.managers.hostManager;
        data.set(this, obj);
    }


    get hosts() {
        try {
            let hosts = new Map();
            let rHosts = Vincent.app.provider.managers.hostManager.validHosts;
            rHosts.forEach((host)=> {
                try {
                    Vincent.app.provider._readAttributeCheck(data.get(this).appUser, host, () => {
                        if (!hosts.get(host.configGroup)) {
                            hosts.set(host.configGroup, []);
                        }
                        hosts.get(host.configGroup).push(new Host(host, data.get(this).session));
                    });
                } catch (e) {
                    //swallow access error
                }
            });
            return hosts;
        } catch (e) {
            data.get(this).session.console.outputError(e.message);
        }
    }

    addHost(hostname, osFamily="Unknown",configGroup = "default") {
        if (typeof hostname === 'string' && typeof configGroup === 'string') {
            var host = new Host(hostname, data.get(this).session, configGroup);
            return host;
        } else {
            data.get(this).session.console.outputError("Parameter hostname must be a hostname string " +
                "and the optional parameter configGroup must be a configuration group string.");
        }
    }

    get list() {
        return this.hosts;
    }

    getHost(hostname, configGroup) {
        if (typeof hostname !== "string") {
            return "Parameter hostname must be of type string.";
        }
        if (configGroup && typeof configGroup !== "string") {
            return "Parameter config is optional and must be of type string if provided.";
        }else if (!configGroup){
            configGroup="default";
        }
        try {
            let hosts = data.get(this).permObj.findValidHost(hostname, configGroup);
            if (hosts) {
                if (Array.isArray(hosts)) {
                    let tmap = new Map();
                    hosts.forEach((host)=> {
                        let h = Vincent.app.provider._readAttributeCheck(data.get(this).appUser, host, () => {
                            return new Host(host, data.get(this).session, configGroup);
                        });
                        tmap.set(h.configGroup, h);
                    });
                    return tmap;
                } else {
                    return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, hosts, ()=> {
                        return new Host(hosts, data.get(this).session);
                    });
                }
            }else{
                let msg = `Host ${hostname} was not found in valid hosts.`;
                logger.error(msg);
                data.get(this).session.console.outputError(msg);
            }
        }catch (e) {
            logger.error(e);
            data.get(this).session.console.outputError(e.message? e.message: e);
        }
    }

    saveHosts() {
        let counter = 0;
        data.get(this).permObj.validHosts.forEach((host)=> {
            let result = this.saveHost(host);
            if (typeof result === 'boolean') {
                counter++;
            }
        });
        return counter;
    }

    load() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                if (Vincent.app.provider.managers.hostManager.loadFromFile()) {
                    return "Hosts have been successfully loaded";
                } else {
                    return "Hosts have been loaded with some errors. Please see log file for details";
                }
            });
        } catch (e) {
            return e.message ? e.message : e;
        }
    }

    saveHost(host) {
        try {
            if (typeof host === 'string') {
                var realhost = data.get(this).permObj.findValidHost(host);
            } else if (host instanceof Host) {
                realhost = data.get(this).permObj.findValidHost(host.name, host.configGroup);
            } else if (host instanceof HostEntity) {
                realhost = host;
            } else {
                return "Parameter host must be a host name string or of type ui/Host.";
            }
            if (Array.isArray(realhost)) {
                let msg = "";
                realhost.forEach((thost)=> {
                    msg += Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, thost, () => {
                        return data.get(this).permObj.saveHost(thost);
                    });
                });
                return msg;
            } else {
                return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, realhost, () => {
                    return data.get(this).permObj.saveHost(realhost);
                });
            }
        } catch (e) {
            return e.message ? e.message : e;
        }
    }

    generatePlaybooks() {
        let counter = 0;
        let promises = [];
        this.list.keys((config)=> {
            this.list.get(config).forEach((host)=> {
                try {
                    promises.push(host.generatePlaybook().then((result)=> {
                        counter++;
                    }));
                } catch (e) {
                    logger.warn(`playbook generation failed for ${host.name}`);
                }
            });
        });
        return Promise.all(promises).then(()=> {
            data.get(this).session.socket.write(`Successfully generated ${counter} playbooks.`);
            return counter;
        });
    }

}

export default HostManager;