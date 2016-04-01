import Database from './utilities/Database';
import SshConfigs from './coremodel/includes/SshConfigs';
import SudoerEntries from './coremodel/includes/SudoerEntries';
import Engine from './modules/engines/AnsibleEngine';
import Config from './Config';
import path from 'path';
import ModuleLoader from './utilities/ModuleLoader';
import logger from './Logger';
import fs from 'fs';

class Provider {

    constructor(path) {
        this.managers = {};
        this.path = path;
        if (!this.path) {
            this.path = process.cwd();
        }

        this.config = new Config(this.path + "/config.ini");
        this.sshConfigs = new SshConfigs(this);
        this.sudoerEntries = new SudoerEntries(this);
        this.database = new Database(this);
        this.engine = new Engine(this);
        this.createManagers();
    }

    /*
    Create all mannagers
     */
    createManagers() {
            let mpath=path.resolve(this.path,'lib/modules');
            return ModuleLoader.parseDirectory(mpath,'Manager',this);
    }

    /*
    Populate data for managers
     */
    loadManagersFromFiles(){
        let promises = [];
        this.managers.forEach(manager=>{
            promises.push(manager.loadFromFile());
        });
        return Promise.all(promises);
    }

    loadFromFile(filename){
        let dbDir = this.getConfigDir();
        return new Promise((resolve,reject)=>{
            fs.readFile(`${dbDir}/${filename}`, 'utf-8', (err, data)=> {
                if (err) {
                    reject(err.message);
                }else {
                    try {
                        let json = JSON.parse(data);
                        resolve(json);
                    } catch (e) {
                        logger.logAndThrow(`Error loading the users config - ${e.message}.`);
                    }
                }
            })
        });
    }
    
    getConfigDir(){
        return  this.config.get('confdir') + '/db';
    }

    clear() {
        this.users.clear();
        this.groups.clear();
        this.hosts.clear();
    }

    clearAll() {
        this.clear();
        this.sshConfigs.clear();
        this.userCategories.clear();
        this.sudoerEntries.clear();
    }

}

export default Provider;