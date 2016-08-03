/**
 * Created by mark on 2016/07/29.
 */

import HistoryEntry from './HistoryEntry';
import {logger} from '../../Logger';
import Host from './Host';
import Engine from '../base/Engine';

class History{

    constructor(engine,host,configGroup) {
        if(!(host instanceof Host) && typeof host!=="string"){
            logger.logAndThrow("Parameter host must be an instance of Host or a host name string.");
        }
        if(!(engine instanceof Engine)){
            logger.logAndThrow("Parameter engine must be an Engine object.");
        }
        this.data = {};
        this.data.host = host.name? host.name: host;
        this.data.configGroup = host.configGroup? host.configGroup: configGroup? configGroup:"default";
        this.data.historyEntries = new Map();
        this.data.engine=engine;
    }

    get host(){
        return this.data.host;
    }
    
    get configGroup(){
        return this.data.configGroup;
    }
    
    get listEntries() {
        let results = [];
        let entries = this.data.historyEntries.entries();
        let entry = entries.next();
        while (!entry.done) {
            results.push({date: new Date(entry.value[0]), status: entry.value[1].status,timestamp: entry.value[0]});
            entry = entries.next();
        }
        return results.reverse();
    }
    
    getEntry(timestamp){
        timestamp= this._getTimestamp(timestamp);
        return this.data.historyEntries.get(timestamp);
    }


    _getTimestamp(timestamp){
        if(typeof timestamp =="string"){
            timestamp= Date.parse(timestamp);
            if(isNaN(timestamp)){
                logger.logAndThrow("The parameter timestamp is not a valid date time string.");
            }
        }
        if(timestamp instanceof Date){
            timestamp= timestamp.getTime();
        }
        if(typeof timestamp!=="number"){
            logger.logAndThrow("Parameter timestamp must be a Date object or a millisecond timestamp integer");
        }
        return timestamp;
    }

    getLastestEntry() {

    }

    getFirstEntry() {

    }

    getEntriesFromTo(start, end) {
        try{
            start = this._getTimestamp(start);
            end = this._getTimestamp(end);
        }catch(e){
            return new Error("Parameters start and end must be valid Date instances, timestamp in milliseconds or a valid date time string.");
        }
        let results = [];
        this.data.historyEntries.forEach((histEntry,key) => {
            if (key >= start && key <= end) {
                results.push(histEntry);
            }
        });
        return results;
    }

    addEntry(timestamp, entry) {
        timestamp= this._getTimestamp(timestamp);
        let rentry= this.data.engine.processEntry(timestamp,entry,this.host);
        this.data.historyEntries.set(timestamp,rentry);
        return rentry;
    }

    deleteEntry(timestamp) {
        timestamp= this._getTimestamp(timestamp);
        return this.data.historyEntries.delete(timestamp);
    }
    
    export(){
        let obj = {};
        obj.host = this.data.host;
        obj.configGroup = this.data.configGroup;
        obj.historyEntries = [];
        this.data.historyEntries.forEach((value,key)=>{
            obj.historyEntries.push(value.export());
        });
        return obj;
    }
}

export default History;