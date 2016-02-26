/**
 * Created by mark on 2016/02/19.
 */

import logger from '../../Logger';
import Provider from '../../Provider';
import fs from 'fs';

class SudoerEntries {

    constructor(provider, sudoerEntriesData) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }

        this.data = {};
        this.data.configs = {};
        let configDir = provider.config.get('confdir');
        if (!sudoerEntriesData) {
            sudoerEntriesData = JSON.parse(fs.readFileSync(
                configDir + '/db/includes/sudoer-entries.json'));
        }

        if (Array.isArray(sudoerEntriesData)) {
            sudoerEntriesData.forEach((sudoerEntryData)=> {
                if (!sudoerEntryData.name || !sudoerEntryData.config) {
                    logger.logAndThrow("The data mus have properties name and config");
                }
                this.data.configs[sudoerEntryData.name] = sudoerEntryData.config;
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