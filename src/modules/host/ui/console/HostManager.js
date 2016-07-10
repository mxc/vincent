/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import Vincent from '../../../../Vincent';
import logger from '../../../../Logger';
import _ from 'lodash';

var data = new WeakMap();


class HostManager {

    constructor(session) {
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
                        hosts.set(host.configGroup,new Host(host, data.get(this).appUser));
                    });
                } catch (e) {
                    //swallow access error
                }
            });
            return hosts;
        } catch (e) {
            console.log(e.message);
            return false;
        }
    }

    addHost(hostname) {
        if (typeof hostname === 'string') {
            var host = new Host(hostname,data.get(this).session);
            //console.log(`created host ${hostname}`);
            return host;
        } else {
            console.log("Parameter must be a hostname string");
        }
    }

    get list() {
            return this.hosts();
    }

    getHost(hostname,configGroup) {
        if(typeof hostname!=="string" ){
            return "Parameter hostname must be of type string.";
        }
        if(configGroup && typeof configGroup!=="string"){
            return "Parameter config is optional and must be of type string if provided.";
        }
        try {
            let hosts = data.get(this).permObj.findValidHost(hostname,configGroup);
            let tmap = new Map();
            hosts.forEach((host)=> {
                let h = Vincent.app.provider._readAttributeCheck(data.get(this).appUser, host, () => {
                    return new Host(host, data.get(this).appUser);
                });
                tmap.set(h.configGroup,h);
            });
            return tmap;
        } catch (e) {
            console.log(e.message);
            return false;
        }
    }

    saveHosts() {
        console.log("saving hosts");
        let counter = 0;
        _.flatten(data.get(this).permObj.validHosts.values()).forEach((host)=> {
            let result = this.saveHost(host);
            if (typeof result ==='boolean') {
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
            } else if (host instanceof Host){
                realhost = data.get(this).permObj.findValidHost(host.name,host.configGroup)[0];
            }else{
                return "Parameter host must be a host name string or of type ui/Host.";
            }
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, realhost, () => {
                if(Array.isArray(realHost)){
                    let msg = "";
                    realhost.forEach((thost)=>{
                           msg += data.get(this).permObj.saveHost(thost);
                        });
                    return msg;
                }else {
                    return data.get(this).permObj.saveHost(realhost);
                }

            });
        } catch (e) {
            return e.message ? e.message : e;
        }
    }


    generatePlaybooks() {
        let counter = 0;
        let promises = [];
        this.list.forEach((host)=> {
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