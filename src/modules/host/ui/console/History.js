/**
 * Created by mark on 2016/07/30.
 */


import Vincent from '../../../../Vincent';
import HistoryEntry from './HistoryEntry';
import TaskObject from '../../../../ui/base/TaskObject';

var data = new WeakMap();

class History extends TaskObject {

    constructor(history, session, host) {
        super(session,history, host);
        let obj = {};
        obj.history = history;
        obj.session = session;
        let rHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name, host.configGroup);
        if (!rHost) {
            throw new Error(`Host ${host.name} is not valid.`);
        }
        obj.permObj = rHost;
        data.set(this, obj);
    }

    get host() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).history.host;
        });
    }

    get configGroup() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).history.configGroup;
        });
    }

    get listEntries() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).history.listEntries;
        });
    }

    getEntry(timestamp) {
        return this._readAttributeWrapper(()=> {
            return new HistoryEntry(data.get(this).history.getEntry(timestamp));
        });
    }

    getLastestEntry() {

    }

    getFirstEntry() {

    }

    getEntriesFromTo(start, end) {
        return this._readAttributeWrapper(()=> {
            let results = [];
            data.get(this).history.getEntriesFromTo(start, end).forEach((entry)=> {
                results.push(new HistoryEntry(entry));
            });
            return results;
        });
    }

    addEntry(timestamp, entry) {
        return this._writeAttributeWrapper(()=> {
            return new HistoryEntry(data.get(this).history.addEntry(timestamp, entry));
        });
    }

    deleteEntry(timestamp) {
        return this._writeAttributeWrapper(()=> {
            if (data.get(this).deleteEntry(timestamp)) {
                data.get(this).session.console.outputSuccess("Entry deleted.");
            } else {
                data.get(this).session.console.outputError("Entry not found.");
            }
        });
    }

    inspect() {
        return this._readAttributeWrapper(()=> {
            let obj = {};
            obj.host = data.get(this).history.name;
            obj.numEntries = data.get(this).history.data.historyEntries.size;
            return obj;
        });
    }

    save() {
        return this._writeAttributeWrapper(()=> {
            if (Vincent.app.provider.managers.hostManager.historyManager.save(data.get(this).history)) {
                data.get(this).session.console.outputSuccess(`Saved history for ${data.get(this).history.name} for ${data.get(this).history.configGroup}`);
            } else {
                data.get(this).session.console.outputSuccess(`Failed to save history for ${data.get(this).history.name} for ${data.get(this).history.configGroup}`);
            }
        });
    }

    load() {
        return this._readAttributeWrapper(()=> {
            if (Vincent.app.provider.managers.hostManager.historyManager.loadFromFile(data.get(this).history.name)) {
                data.get(this).session.console.outputSuccess(`Loaded history for ${data.get(this).history.name} for ${data.get(this).history.configGroup}`);
            } else {
                data.get(this).session.console.outputSuccess(`Failed to save history for ${data.get(this).history.name} for ${data.get(this).history.configGroup}`);
            }
        });
    }
}

export default History;