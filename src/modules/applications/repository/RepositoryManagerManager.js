/**
 * Created by mark on 2016/07/30.
 */

import {logger} from '../../../Logger';
import Manager from '../../base/Manager';
import YumRepositoryManager from './YumRepositoryManager';
import AptRepositoryManager from './AptRepositoryManager';
import HostManager from '../../../modules/host/HostManager';
import Provider from  '../../../Provider';
import RepositoryManagerManagerUI from './ui/console/RepositoryManagerManager';
import base from '../../base/Base';
import SystemUpdateManager from '../systemupdate/SystemUpdateManager';

class RepositoryManagerManager extends Manager {

    constructor(provider) {
        if (!(provider instanceof Provider)) {
            logger.logAndThrow("Parameter provider must be an objec to type Provider");
        }
        super(provider);
        this.provider = provider;
        this.engines = provider.loader.loadEngines('repository', provider);
    }

    static getDependencies() {
       return [HostManager];
    }



    getRepositoryManager(host, configGroup) {
        let rhost = base.getValidHostFromHostParameter(this.provider.managers.HostManager, host, configGroup);
        return this.getRepositoryManagerForOsFamily(rhost.osFamily);
    }

    _getRepositoryManagerForOsFamily(family) {
        let repoManager;
        if (base.isKnownOsFamily(family)) {
            switch (family.toLowerCase()) {
                case base.listOsFamilies.debian:
                    repoManager = new AptRepositoryManager(this.provider);
                    break;
                case base.listOsFamilies.redhat:
                    repoManager = new YumRepositoryManager(this.provider);
                    break;
                default:
                    throw new Error(`RepositoryManager for ${family} not yet implements.`);
            }
        }
        return repoManager;
    }

    loadHost(hosts, host, hostDef) {
        if(hostDef.configs && hostDef.configs.repository) {
            if (base.isKnownOsFamily(host.osFamily)) {
                let repo;
                if (host.osFamily.toLowerCase() == "debian") {
                    repo = new AptRepositoryManager(this.provider, hostDef.configs.repository);
                } else if (host.osFamily.toLowerCase() == "redhat") {
                    repo = new YumRepositoryManager(this.provider, hostDef.configs.repository);
                }
                if (repo) {
                    host.addConfig("repository", repo);
                } else {
                    logger.logAndAddToErrors("Repository configuration found for ${host.osFamily} but it failed to load.",
                        hosts.errors[host.name].get(host.configGroup));
                }
            } else {
                logger.logAndAddToErrors(`Repository configuration found but osFamily ${host.osFamily} did not match any osFamily repository manager.`,
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

    exportToEngine(engine, host, tasks) {
        this.engines[engine].exportToEngine(host, tasks);
    }

    clear() {
        //na
    }


    loadConsoleUIForSession(context, session) {
        if (!context.applicationManagers) {
            context.applicationManagers = {};
        }

        context.applicationManagers.repositoryManagerManager = new RepositoryManagerManagerUI(session);
    }


    loadWebUI() {
        throw new Error("Method loadWebUI must be overridden in child object");
    }

    deleteEntity(hc) {
        //na
    }

    entityStateChange(hc) {
        //throw new Error("Method getDependencies must be overridden in child object");
    }

    addConfigToHost(host) {
        host = base.getValidHostFromHostParameter(this.provider.managers.hostManager, host);
        let repo = this._getRepositoryManagerForOsFamily(host.osFamily);
        host.addConfig("repository", repo);
        return repo;
    }

}

export default RepositoryManagerManager;