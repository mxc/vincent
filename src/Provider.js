import Database from './utilities/Database';
import Engine from './modules/engines/AnsibleEngine';
import Config from './Config';
import path from 'path';
import ModuleLoader from './utilities/ModuleLoader';
import logger from './Logger';
import fs from 'fs';
import Manager from './modules/base/Manager';
import mkdirp from 'mkdirp';


class Provider {

    constructor(appdir) {
        this.managers = {};
        this.configDir = appdir;
        if (!this.configDir) {
            this.configDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
            this.configDir = path.resolve(this.configDir, ".vincent");
        }
        this.createManagers();
        this.config = new Config(path.resolve(this.configDir));
        this.makeDBDir();
        this.database = new Database(this);
        //todo lookup default engine from config file.
        this._engine = new Engine(this);
    }

    makeDBDir() {
        try {
            var stat = fs.statSync(this.getDBDir());
        } catch (e) {
            logger.info(`${this.getDBDir()} does not exists. It will be created`);
            fs.mkdirSync(this.getDBDir());
        }

        try {
            fs.statSync(`${this.getDBDir()}/hosts`);
        } catch (e) {
            fs.mkdirSync(`${this.getDBDir()}/hosts`);
            logger.info(`${this.getDBDir()}/hosts does not exists. It will be created`);
        }

        try {
            fs.statSync(`${this.getDBDir()}/includes`);
        } catch (e) {
            fs.mkdirSync(`${this.getDBDir()}/includes`);
            logger.info(`${this.getDBDir()}/includes does not exists. It will be created`);
        }

    }

    /**
     Allow export engine to be set programatically
     */
    set engine(engine) {
        this._engine = engine;
    }

    get engine() {
        return this._engine;
    }

    /**
     Create all managers
     */
    createManagers() {
        let mpath = path.resolve(this.getRootDir(), 'lib/modules');
        return ModuleLoader.parseDirectory(mpath, 'Manager', this);
    }

    getManagerFromClassName(manager) {
        let name = manager.name.charAt(0).toLowerCase() + manager.name.slice(1);
        try {
            return this.managers[name];
        } catch (e) {
            logger.error(`Could not find manager ${name} in list of available managers`);
        }
    }

    /**
     *
     */
    loadAll() {
        let status = true;
        ModuleLoader.managerOrderedIterator((managerClass)=> {
            let manager = this.getManagerFromClassName(managerClass);
            if (!manager || !manager.loadFromFile()) {
                logger.error(`There was an error calling loadFromFile on ${managerClass.name}`);
                status = false;
            }
        }, this);
        return status;
    }

    /**
     * Persist all data files.
     */
    saveAll() {

        let historyDir = this.makeArchiveDir();

        //move host file
        try {
            let filename = this.dbDir + "/hosts";
            let exists = fs.statSync(filename);
            let archivePath = historyDir + "/hosts";
            fs.renameSync(filename, archivePath);
        } catch (e) {
            logger.info(`No hosts folder to backup`);
        }

        //move users file
        try {
            let filename = this.dbDir + "/users.json";
            let exists = fs.statSync(filename);
            let archivePath = historyDir + "/users.json";
            fs.renameSync(filename, archivePath);
        } catch (e) {
            logger.info(`No users.json folder to backup`);
        }

        //move groups file
        try {
            let filename = this.dbDir + "/groups.json";
            let exists = fs.statSync(filename);
            let archivePath = historyDir + "/groups.json";
            fs.renameSync(filename, archivePath);
        } catch (e) {
            logger.info(`No groups.json folder to backup`);
        }

        this.saveUsers(false);
        this.saveGroups(false);
        this.provider.managers.hostManager.validHosts.forEach((host)=> {
            this.saveHost(host, false);
        });
    }


    /**
     * Utility function for the save function of Manager objects.
     * @returns {*}
     */
    makeArchiveDir() {
        let archive = dateformat(new Date, "yyyy-mm-dd-HH:MM:ss");
        let archiveDir = path.resolve(this.dbDir, archive);

        try {
            var stat = fs.statSync(archiveDir);
        } catch (e) {
            logger.info(`${archiveDir} does not exists. It will be created`);
            fs.mkdirSync(archiveDir);
        }

        try {
            fs.statSync(`${archiveDir}/hosts`);
        } catch (e) {
            fs.mkdirSync(`${archiveDir}/hosts`);
            logger.info(`${archiveDir}/hosts does not exists. It will be created`);
        }

        try {
            fs.statSync(`${archiveDir}/includes`);
        } catch (e) {
            fs.statSync(`${archiveDir}/includes`);
            logger.info(`${archiveDir}/includes does not exists. It will be created`);
        }
        return archiveDir;
    }

    fileExists(filename) {
        try {
            fs.statSync(path.resolve(this.getDBDir(), filename));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Populate data for managers from text files.
     * @returns {Promise}
     */
    loadManagersFromFiles() {
        let promises = [];
        this.managers.forEach(manager=> {
            promises.push(manager.loadFromFile());
        });
        return Promise.all(promises);
    }

    /**
     * Utility function used by managers to load their data files from  the config directory
     * @param filename
     * @returns {Promise}
     */
    loadFromFile(filename) {
        let dbDir = this.getDBDir();
        let data = fs.readFileSync(`${dbDir}/${filename}`, 'utf-8');
        try {
            return JSON.parse(data);
        } catch (e) {
            logger.logAndThrow(`Error loading the users config - ${e.message}.`);
        }
    }

    saveToFile(filename, manager, backup) {
        let archivePath = "";
        let currentPath = path.resolve(this.getDBDir() + "/" + filename);
        if (backup) {
            try {
                var stat = fs.statSync(currentPath);
                //let archivePath = "";
                if (stat && stat.isFile()) {
                    archivePath = this.makeArchiveDir() + filename;
                    fs.renameSync(currentPath, archivePath);
                }
            } catch (e) {
                logger.warn(`${filename} file does not exists.`);
            }
        }
        let groups = JSON.stringify(manager.export(), null, 2);
        fs.writeFileSync(currentPath, groups);
        return archivePath;
    }

    /**
     * Convenience function to return the configure datastore directory
     * @returns {*}
     */
    getDBDir() {
        let loc = path.resolve(this.configDir, this.config.get('dbdir'));
        //check if config directory exists
        try {
            var stat = fs.statSync(loc);
        } catch (e) {
            mkdirp(loc);
        }
        //ensure host directory exists
        let hostloc = path.resolve(loc, "hosts");
        try {
            stat = fs.statSync(hostloc);
        } catch (e) {
            mkdirp(hostloc);
        }
        return loc;
    }

    /**
     * Convenience function to retrieve the datastore location for generated files for automation engines
     * @returns {*}
     */
    getEngineDir() {
        let loc = path.resolve(this.configDir, this.config.get('enginedir'));
        //check if config directory exists
        try {
            var stat = fs.statSync(loc);
        } catch (e) {
            mkdirp(loc);
        }
        return loc;
    }

    /**
     * Convenience function to retrieve Vincent's configuration directory
     * @returns {*}
     */
    getConfigDir() {
        let loc = path.resolve(this.configDir);
        //check if config directory exists
        try {
            var stat = fs.statSync(loc);
        } catch (e) {
            mkdirp(loc);
        }
        return loc;
    }

    /**
     * Convenience function to retrieve the location of Vincent's modules
     * @returns {string}
     */
    getRootDir() {
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