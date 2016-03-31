/**
 * Created by mark on 2016/02/19.
 */

import logger from '../../Logger';
import Provider from '../../Provider';
import fs from 'fs';

class SudoerEntries {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        this._state="not loaded";
        this.data = {};
        this.data.configs = {};
        this.provider = provider;
    }

    add(SudoEntry){
        //todo
    }

    get configs(){
        return this.data.configs;
    }

    get state(){
        return this._state;
    }

    load(sudoerEntriesData) {
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

    find(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }
}


export default SudoerEntries;