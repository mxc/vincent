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

    import(sudoerEntriesData) {
        if (sudoerEntriesData) {
            this.load(sudoerEntriesData);
            return;
        }
        let configDir = provider.config.get('confdir');
        fs.readFileSync(
            configDir + '/db/includes/sudoer-entries.json', (err, data)=> {
                sudoerEntriesData = JSON.parse(data);
                try{
                this.load(sudoerEntriesData);
                } catch (e) {
                    logger.warn("Failed to load2 Sudoer Entries from file system.");
                }
            });
    }

    load(sudoerEntriesData) {
        if (Array.isArray(sudoerEntriesData)) {
            sudoerEntriesData.forEach((sudoerEntryData)=> {
                if (!sudoerEntryData.name || !sudoerEntryData.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[sudoerEntryData.name] = sudoerEntryData.config;
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