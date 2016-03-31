import Hosts from './modules/host/HostManager';
import Database from './utilities/Database';
import SshConfigs from './coremodel/includes/SshConfigs';
import SudoerEntries from './coremodel/includes/SudoerEntries';
import Engine from './modules/engines/AnsibleEngine';
import Config from './Config';
import path from 'path';
import ModuleLoader from './utilities/ModuleLoader';



class Provider {

    constructor(path) {
        this.managers = {};
        this.path = path;
        if (!this.path) {
            this.path = process.cwd();
        }

        this.config = new Config(this.path + "/config.ini");
        this.hosts = new Hosts(this);
        this.sshConfigs = new SshConfigs(this);
        this.sudoerEntries = new SudoerEntries(this);
        this.database = new Database(this);
        this.engine = new Engine(this);
        this.loadManagers();
    }

    loadManagers() {
            let mpath=path.resolve(this.path,'lib/modules');
            return ModuleLoader.parseDirectory(mpath,'Manager',this);
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