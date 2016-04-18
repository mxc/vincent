import Database from './utilities/Database';
import Engine from './modules/engines/AnsibleEngine';
import Config from './Config';
import path from 'path';
import ModuleLoader from './utilities/ModuleLoader';
import logger from './Logger';
import fs from 'fs';
import Manager from './modules/base/Manager';
import mkdirp from 'mkdirp';
import TextDatastore from './utilities/TextDatastore';

class Provider {

    constructor(appdir) {
        this.managers ={};
        this.configDir = appdir;
        if (!this.configDir) {
            this.configDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
            this.configDir = path.resolve(this.configDir,".vincent");
        }
        this.createManagers();
        this.config = new Config(path.resolve(this.configDir));
        this.textDatastore = new TextDatastore(this);
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
        let mpath = path.resolve(this.getRootDir(), 'lib/modules');
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

    /*
    Utility function used by managers to load their data files from  the config directory
     */
    loadFromFile(filename) {
        let dbDir = this.getDBDir();
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

    getDBDir() {
        let loc = path.resolve(this.configDir, this.config.get('dbdir'));
        //check if config directory exists
        try{
            var stat = fs.statSync(loc);
        }catch(e){
            mkdirp(loc);
        }
        //ensure host directory exists
        let hostloc=path.resolve(loc,"hosts");
        try{
            stat = fs.statSync(hostloc);
        }catch(e){
            mkdirp(hostloc);
        }
        return loc;
    }

    getEngineDir(){
        let loc = path.resolve(this.configDir, this.config.get('enginedir'));
        //check if config directory exists
        try{
            var stat = fs.statSync(loc);
        }catch(e){
            mkdirp(loc);
        }
        return loc;
    }

    getConfigDir() {
        let loc  = path.resolve(this.configDir);
        //check if config directory exists
        try{
            var stat = fs.statSync(loc);
        }catch(e){
            mkdirp(loc);
        }
        return loc;
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