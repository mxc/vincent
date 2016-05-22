/**
 * Created by mark on 2016/02/19.
 */

import logger from '../../Logger';
import Provider from '../../Provider';
import Manager from '../base/Manager';
import ModuleLoader from '../../utilities/ModuleLoader';
import HostSudoEntry from './HostSudoEntry';
import UserManager from '../user/UserManager';
import GroupManager from '../group/GroupManager';

class SudoManager extends Manager {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        super();
        this._state="not loaded";
        this.data = {};
        this.data.configs = {};
        this.provider = provider;
        this.engines = ModuleLoader.loadEngines('sudo',this.provider);
    }


    exportToEngine(engine,host,struct){
        this.engines[engine].exportToEngine(host,struct);
    }

    addSudoEntry(SudoEntry){
        //todo
    }

    get configs(){
        return this.data.configs;
    }

    get state(){
        return this._state;
    }

    loadFromFile(){
        if (this.provider.fileExists("includes/sudoer-entries.json")) {
            let loc = "includes/sudoer-entries.json";
            let data = this.provider.loadFromFile(loc);
            if (data) {
                return this.loadFromJson(data);
            }
        } else {
            logger.warn("Cound not load includes/sudoer-entries.json. File not found");
        }
    }

    loadFromJson(sudoerEntriesData) {
        if (Array.isArray(sudoerEntriesData)) {
            sudoerEntriesData.forEach((sudoerEntryData)=> {
                if (!sudoerEntryData.name || !sudoerEntryData.userList || !sudoerEntryData.commandSpec) {
                    logger.logAndThrow("The data mus have properties name, userList and commandSpec");
                }
                this.data.configs[sudoerEntryData.name] = sudoerEntryData;
                this._state="loaded";
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

    loadHost(hosts, host, hostDef){
        if (hostDef.sudoerEntries) {
            hostDef.sudoerEntries.forEach((sudoEntryData)=> {
                try {
                    this.addSudoEntry(host,sudoEntryData);
                } catch (e) {
                    console.log(e);
                    hosts.errors[host.name].push(e.message);
                }
            });
        }

        if (hostDef.includes) {
            let sudoerEntries = hosts.findIncludeInDef("sudoerEntries", hostDef.includes);
            if (sudoerEntries) {
                sudoerEntries.forEach((sudoEntry) => {
                    try {
                        this.addSudoEntry(host,sudoEntry);
                    } catch (e) {
                        logger.logAndAddToErrors(`${e.message}`,hosts.errors[host.name]);
                    }
                });
            }
        }
    }

    addSudoEntry(host,sudoData) {
        if (!host.data.sudoerEntries) {
            host.data.sudoerEntries = [];
        }
        try {
            if (typeof sudoData == "string") {
                if (!host._export.includes) {
                    host._export.includes = {};
                    host._export.includes.sudoerEntries = [];
                } else if (!host._export.includes.sudoerEntries) {
                    host._export.includes.sudoerEntries = [];
                }
                let sudoDataLookup = this.findSudoEntry(sudoData);
                let hostSudoEntry = new HostSudoEntry(this.provider, host, sudoDataLookup);
                host.data.sudoerEntries.push(hostSudoEntry);
                host._export.includes.sudoerEntries.push(sudoData);
            } else {
                let hostSudoEntry = new HostSudoEntry(this.provider, host, sudoData);
                host.data.sudoerEntries.push(hostSudoEntry);
                if (!host._export.sudoerEntries) {
                    host._export.sudoerEntries = [];
                }
                host._export.sudoerEntries.push(hostSudoEntry.sudoEntry.export());
            }
        }
        catch (e) {
            logger.logAndThrow(`Error adding SudoerEntry - ${e.message}`);
        }
    }

    getSudoerEntries(host) {
        return host.data.sudoerEntries;
    }

    static getDependencies(){
        return [UserManager,GroupManager];
    }

    loadConsoleUIForSession(context,appUser) {
        //no op
    }

    loadConsoleUI(){
        
    }
}


export default SudoManager;