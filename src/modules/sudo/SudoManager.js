/**
 * Created by mark on 2016/02/19.
 */

import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import ModuleLoader from '../../utilities/ModuleLoader';
import HostSudoEntry from './HostSudoEntry';
import SudoEntry from './SudoEntry';
import UserManager from '../user/UserManager';
import User from '../user/User';
import Group from '../group/Group';
import GroupManager from '../group/GroupManager';
import Host from '../host/Host';
import HostComponentContainer from '../base/HostComponentContainer';

class SudoManager extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this.data = {};
        this.data.configs = {};
        this.provider = provider;
        this.engines = ModuleLoader.loadEngines('sudo', this.provider);
    }


    exportToEngine(engine, host, struct) {
        this.engines[engine].exportToEngine(host, struct);
    }

    get configs() {
        return this.data.configs;
    }

    get state() {
        return this._state;
    }

    loadFromFile() {
        if (this.provider.fileExists("includes/sudoer-entries.json")) {
            let loc = "includes/sudoer-entries.json";
            let data = this.provider.loadFromFile(loc);
            if (data) {
                return this.loadFromJson(data);
            }
        } else {
            logger.warn("Could not load includes/sudoer-entries.json. File not found.");
        }
    }

    loadFromJson(sudoerEntriesData) {
        if (Array.isArray(sudoerEntriesData)) {
            sudoerEntriesData.forEach((sudoerEntryData)=> {
                if (!sudoerEntryData.name || !sudoerEntryData.userList || !sudoerEntryData.commandSpec) {
                    logger.logAndThrow("The data mus have properties name, userList and commandSpec.");
                }
                this.data.configs[sudoerEntryData.name] = new SudoEntry(this.provider, sudoerEntryData);
            });
        } else {
            throw new Error("The sudoerEntriesData variable should be an array of SudoerEntryDefs.");
        }
    }

    findSudoEntry(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }

    loadHost(hosts, host, hostDef) {
        if (hostDef.config && hostDef.config.sudoerEntries) {
            hostDef.config.sudoerEntries.forEach((sudoEntryData)=> {
                try {
                    this.addHostSudoEntry(host, sudoEntryData);
                } catch (e) {
                    hosts.errors[host.name].get(host.configGroup).push(e.message);
                }
            });
        }
    }

    addHostSudoEntry(host, sudoData) {
        if(!host instanceof Host){
            logger.logAndThrow(`Paramter host must be an instance of Host.`);
        }
        let entry;
        if (typeof sudoData == "string") {
            entry = this.findSudoEntry(sudoData);
        } else if (sudoData instanceof SudoEntry || typeof sudoData == 'object') {
            entry = sudoData;
        }
        if (entry) {
            let hostSudoEntry = new HostSudoEntry(this.provider, host, entry);

            if (!host.data.config) {
                host.data.config = new HostComponentContainer("config");
            }

            if (!host.data.config.get("sudoerEntries")) {
                host.data.config.add("sudoerEntries", []);
            }
            host.data.config.get("sudoerEntries").push(hostSudoEntry);
        } else {
            logger.logAndThrow(`${sudoData} could not be found in sudo entries and is not an instance of SuDoEntry.`);
        }
    }

    removeUserGroupFromHostSudoEntries(host, item) {
        if (!host instanceof Host) {
            logger.logAndThrow("Parameter host must be an instance of Host.");
        }
        if (!(item instanceof User) && !(item instanceof Group)) {
            logger.logAndThrow("Parameter item must be an instance of User or Group.");
        }
        if (host.data.config && host.data.config.get("sudoerEntries")) {
            host.data.config.get("sudoerEntries").forEach((hse)=> {
                hse.sudoEntry.removeUserGroup(item);
            });
        }
    }

    findHostsWithSudoEntriesForUser(user) {
        user = this.provider.managers.userManager.findValidUser(user);
        return this.provider.managers.hostManager.validHosts.filter((host)=> {
            let hses = this.provider.managers.sudoManager.getHostSudoerEntries(host);
            if (hses) {
                if (hses.find((hse)=> {
                        if (hse.sudoEntry.containsUser(user)) {
                            return hse;
                        }
                    })) {
                    return host;
                }
            }
        });
    }

    findHostsWithSudoEntriesForGroup(group) {
        group = this.provider.managers.groupManager.findValidGroup(group);
        return this.provider.managers.hostManager.validHosts.filter((host)=> {
            let hses = this.getHostSudoerEntries(host);
            if (hses.find((hse)=> {
                    if (hse.sudoEntry.containsGroup(group)) {
                        return hse;
                    }
                })) {
                return host;
            }
        });
    }

    findHostSudoEntriesForUser(user) {
        user = this.provider.managers.userManager.findValidUser(user);
        let hosts = this.findHostsWithSudoEntriesForUser(user);
        let hses = [];
        hosts.forEach((h)=> {
            this.getHostSudoerEntries(h).forEach((hse)=> {
                if (hse.sudoEntry.containsUser(user)) {
                    hses.push(hse);
                }
            });
        });
        return hses;
    }

    getHostSudoerEntries(host) {
        if (host.data.config) {
            return host.data.config.get("sudoerEntries");
        }else{
            return [];
        }
    }

    static getDependencies() {
        return [UserManager, GroupManager];
    }

    loadConsoleUIForSession(context, session) {
        //no op
    }

    loadConsoleUI() {

    }
}


export default SudoManager;