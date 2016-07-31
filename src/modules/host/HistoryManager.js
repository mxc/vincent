/**
 * Created by mark on 2016/07/28.
 */

import {logger} from '../../Logger';
import History from './History';
import base from '../base/Base';

class HistoryManager {

    constructor(provider) {
        this.provider = provider;
    }

    createHistory(host){
        host = base.getValidHostFromHostParameter(this.provider.managers.hostManager,host);
        return new History(this.provider.engine,host);
    }
    
    loadFromFile(host) {
        if(!(host.configGroup)|| !(host.name)){
            logger.logAndThrow("Paramter host must be an host name and configGroup property.");
        }
        let json = this.provider.loadFromFile(`history/${host.configGroup}/${host.name}.json`);
        if (json) {
           return this.loadHistory(json);
        }else{
            return [];
        }
    }

    loadHistory(json) {
        let host = json.host;
        if(!host){
            logger.logAndThrow("Invalid json string for History object.");
        }
        let configGroup = json.configGroup;
        let history = new History(this.provider.engine,host,configGroup);
        if (json.historyEntries) {
            json.historyEntries.forEach((item)=> {
            history.addEntry(item.timestamp, item.entry);
        });
    }
        return history;
    }

    save(history) {
        return this.provider.saveToFile(`history/${history.configGroup}/${history.name}.json`, history,true);
    }

}

export default HistoryManager;