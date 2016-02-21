/**
 * Created by mark on 2016/02/19.
 */

import logger from '../../utilities/Logger';

class SudoerEntries{
    
    constructor(provider, suDoerEntriesData) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }

        this.data = {};
        this.data.configs = {};
        if (!suDoerEntriesData) {
            suDoerEntriesData = JSON.parse(fs.readFileSync(provider.configdir + '/includes/sudoer-entries.json'));
        }

        if (Array.isArray(suDoerEntriesData)) {
            suDoerEntriesData.forEach((sudoerEntryData)=> {
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