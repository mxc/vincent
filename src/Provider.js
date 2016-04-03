import Database from './utilities/Database';
import Engine from './modules/engines/AnsibleEngine';
import Config from './Config';
import path from 'path';
import ModuleLoader from './utilities/ModuleLoader';
import logger from './Logger';
import fs from 'fs';
import Manager from './modules/base/Manager';

class Provider {

    constructor(appdir) {
        this.managers = {};
        this.appdir = appdir;
        if (!this.appdir) {
            this.appdir = process.cwd();
        }
        this.createManagers();
        this.config = new Config(path.resolve(this.appdir + "/config.ini"));
        this.database = new Database(this);
        //todo lookup default engine from config file.
        this._engine = new Engine(this);
    }

    /*
    Allow export engine to be set programatically
     */
    set engine(engine){
        this._engine = engine;
    }
    
    get engine(){
        return this._engine;
    }

    /*
     Create all managers
     */
    createManagers() {
        let mpath = path.resolve(this.appdir, 'lib/modules');
        return ModuleLoader.parseDirectory(mpath, 'Manager', this);
    }

    /*
     Populate data for managers from text files.
     */
    loadManagersFromFiles() {
        let promises = [];
        this.managers.forEach(manager=> {
            promises.push(manager.loadFromFile());
        });
        return Promise.all(promises);
    }

    loadFromFile(filename) {
        let dbDir = this.getDBConfigDir();
        return new Promise((resolve, reject)=> {
            fs.readFile(`${dbDir}/${filename}`, 'utf-8', (err, data)=> {
                if (err) {
                    reject(err.message);
                } else {
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

    getDBConfigDir() {
        return path.resolve(this.getRootDir(), this.config.get('confdir'),'db');
    }

    getConfigDir() {
        return path.resolve(this.getRootDir(), this.config.get('confdir'));
    }

    
    getRootDir(){
        let dir = __dirname.split(path.sep);
        dir.pop();
        return dir.join(path.sep);
    }

    clear() {
        for (let manager in this.managers) {
            if (manager instanceof Manager) {
                manager.clear();
            }
        }
    }

}

export default Provider;