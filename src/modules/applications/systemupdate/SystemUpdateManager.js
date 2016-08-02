/**
 * Created by mark on 2016/07/25.
 */

import {logger} from '../../../Logger';
import Manager from '../../base/Manager';
import Redhat from './Redhat';
import Debian from './Debian';
import HostManager from '../../../modules/host/HostManager';
import base from '../../base/Base';
import Provider from  '../../../Provider';
import SystemUpateManagerUI from './ui/console/SystemUpdateManager';


class SystemUpdateManager extends Manager {

    constructor(provider) {
        if(!(provider instanceof Provider)){
            logger.logAndThrow("Parameter provider must be an objec to type Provider");
        }
        super(provider);
        this.provider = provider;
        this.engines = provider.loader.loadEngines('sysUpdate', provider);
    }

    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    loadHost(hosts, host, hostDef) {
        if (hostDef.configs && hostDef.configs.systemUpdate) {
            let sysUpdate;
            if (host.osFamily.toLowerCase() == "debian") {
                sysUpdate = new Debian(this.provider, hostDef.configs.systemUpdate);
            } else if (host.osFamily.toLowerCase() == "redhat") {
                sysUpdate = new Redhat(this.provider, hostDef.configs.systemUpdate);
            }
            if (sysUpdate) {
                host.addConfig("systemUpdate", sysUpdate);
            } else {
                logger.logAndAddToErrors("System update configuration found but it did not match any osFamily update manager.",
                    hosts.errors[host.name].get(host.configGroup));
            }
        }
    }

    loadFromFile() {
        //na
    }

    loadFromJson(data) {
        //na
    }


    clear() {
        //na
    }

    loadConsoleUIForSession(context, session) {
        if (!context.applicationManagers) {
            context.applicationManagers = {};
        }
        context.applicationManagers.systemUpateManager = new SystemUpateManagerUI(session);
    }


    loadWebUI() {
    }

    static getDependencies() {
        return [HostManager];
    }

    deleteEntity(hc) {
    }

    entityStateChange(hc) {
    }

    addConfigToHost(host) {
        let sysUpdate;
        let vHost = base.getValidHostFromHostParameter(this.provider.managers.hostManager,host);

        if (vHost.osFamily && vHost.osFamily.toLowerCase() == "redhat") {
            sysUpdate = new Redhat(this.provider,{upgrade:true});
        } else if (vHost.osFamily && vHost.osFamily.toLowerCase() == "debian") {
            sysUpdate = new Debian(this.provider,{upgrade:true});
        }else{
            throw new Error(`No System Update class found for osFamily ${vHost.osFamily}`);
        }
        vHost.configs.add("systemUpdate", sysUpdate);
        return sysUpdate;
    }

}

export default SystemUpdateManager;