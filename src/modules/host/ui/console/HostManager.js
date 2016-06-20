/**
 * Created by mark on 2016/04/16.
 */
import Host from './Host';
import Provider from '../../../../Provider';
import Vincent from '../../../../Vincent';
import logger from '../../../../Logger';


var data = new WeakMap();


class HostManager {

    constructor(appUser) {
        let obj = {};
        obj.appUser = appUser;
        obj.permObj = Vincent.app.provider.managers.hostManager;
        data.set(this,obj);
    }

    get hosts(){
        try {
            let hosts =[];
            let rHosts = Vincent.app.provider.managers.hostManager.validHosts;
            rHosts.forEach((host)=>{
                try {
                    Vincent.app.provider._readAttributeCheck(data.get(this).appUser, host, () => {
                        hosts.push(new Host(host, data.get(this).appUser));
                    });
                }catch(e){
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
            var host = new Host(hostname, data.get(this).appUser);
            //console.log(`created host ${hostname}`);
            return host;
        } else {
            console.log("Parameter must be a hostname string");
        }
    }

    get list() {
        let tmpList = data.get(this).permObj.validHosts.filter((host=> {
            try {
                return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, host, ()=> {
                    return true
                });
            } catch (e) {
                return false;
            }
        }));
        return tmpList.map((host)=> {
            return new Host(host, data.get(this).appUser);
        });
    }

    getHost(hostname) {
        try {
            let host = data.get(this).permObj.findValidHost(hostname);
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, host, () => {
                return new Host(host, data.get(this).appUser);
            });
        } catch (e) {
            console.log(e.message);
            return false;
        }
    }

    saveHosts() {
        console.log("saving hosts");
        let counter = 0;
        data.get(this).permObj.validHosts.forEach((host)=> {
            if (this.saveHost(host)) {
                counter++;
            }
        });
        return counter;
    }

    load(){
        try{
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser,data.get(this).permObj,()=>{
                if(Vincent.app.provider.managers.hostManager.loadFromFile()){
                    return "Hosts have been successfully loaded";    
                }else{
                    return "Hosts have been loaded with some errors. Please see log file for details";
                }
            });
        }catch(e){
            return e.message? e.message: e;
        }
    }

    saveHost(host) {
        try {
            if (typeof host === 'string') {
                var realhost = data.get(this).permObj.findValidHost(host);
            } else {
                realhost = host;
            }
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, realhost, () => {
                return data.get(this).permObj.saveHost(realhost);
                //console.log(`host ${realhost.name} successfully saved`);
            });
        }catch(e){
            return e.message? e.message: e;
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