/**
 * Created by mark on 2016/07/25.
 */

import {logger} from '../../../Logger';
import Manager from '../../base/Manager';
import SystemUpdate from './SystemUpdate';
import Redhat from './Redhat';
import Debian from './Debian';
import HostManager from '../../../modules/host/HostManager';
import Session from '../../../ui/Session';
import Host from  '../../host/Host';
import SystemUpateManagerUI from './ui/console/SystemUpdateManager';


class SystemUpdateManager extends Manager{

    constructor(provider){
        super(provider);
        this.provider = provider;
        this.engines = provider.loader.loadEngines('sysUpdate', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    loadHost(hosts, host, hostDef){
            if(hostDef.configs && hostDef.configs.systemUpdate){
                let sysUpdate;
                if(host.osFamily.toLowerCase()=="debian"){
                    sysUpdate = new Debian(this.provider,hostDef.configs.systemUpdate);
                }else if(host.osFamily.toLowerCase()=="redhat"){
                    sysUpdate = new Redhat(this.provider,hostDef.configs.systemUpdate);
                }
                if(sysUpdate){
                    host.configs.add("systemUpdate",sysUpdate);
                }else{
                    logger.logAndAddToErrors("System update configuration found but it did not match any osFamily update manager.",
                        hosts.errors[host.name].get(host.configGroup));
                }
            }
    }

    loadFromFile(){
        //na
    }

    loadFromJson(data){
        //na
    }


    clear(){
        //na
    }

    loadConsoleUIForSession(context,session){
        if(!context.applications){
            context.applicationManagers = {};
        }
        context.applicationManagers.sysUpate = new SystemUpateManagerUI(session);
    }


    loadWebUI(){
    }

    static getDependencies(){
            return [HostManager];
    }

    deleteEntity(hc){
    }

    entityStateChange(hc){
    }

    addSystemUpdateToHost(host, systemUpdate){
        if(!(host instanceof Host) || !(systemUpdate instanceof SystemUpdate)){
                logger.logAndThrow("Parameter host must be an instance of Host and systemupdate must be an instance of SystemUpdate.");
        }
        if(systemUpdate instanceof Redhat){
            if (host.osFamily.toLocaleLowerCase()!=="redhat"){
                logger.logAndThrow(`The host is os family is ${host.osFamily}. Redhat system update instance is not valid for this host.`);
            }
        }else if (systemUpdate instanceof Debian){
            if (host.osFamily.toLocaleLowerCase()!=="debian"){
                logger.logAndThrow(`The host is os family is ${host.osFamily}. Debian system update instance is not valid for this host.`);
            }
        }
        host.configs.add("systemUpdate",systemUpdate);
    }

}

export default SystemUpdateManager;