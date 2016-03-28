import UserManager from './modules/user/UserManager';
import Groups from './modules/group/Groups';
import Hosts from './modules/host/Hosts';
import Database from './utilities/Database';
import SshConfigs from './coremodel/includes/SshConfigs';
import UserCategories from './modules/user/UserCategories';
import GroupCategories from './modules/group/GroupCategories';
import SudoerEntries from './coremodel/includes/SudoerEntries';
import Engine from './modules/engines/AnsibleEngine';
import Config from './Config';
import System from 'systemjs';
import fs from 'fs';
import path from 'path';
import ModuleLoader from './utilities/ModuleLoader';

/* This test will load propoerties from the config.ini file in the cwd. Database login credentials shoul be supplied
 thre.  */

class Provider {

    constructor(path) {
        this.managers = {};
        this.path = path;
        if (!this.path) {
            this.path = process.cwd();
        }

        this.config = new Config(this.path + "/config.ini");
        this.users = new UserManager(this);
        this.groups = new Groups(this);
        this.hosts = new Hosts(this);
        this.sshConfigs = new SshConfigs(this);
        this.userCategories = new UserCategories(this);
        this.groupCategories = new GroupCategories(this);
        this.sudoerEntries = new SudoerEntries(this);
        this.database = new Database(this);
        this.engine = new Engine(this);
    }

    loadManagers() {
            let mpath=path.resolve(this.path,'src/modules');
            return ModuleLoader.parseDirectory(mpath,'Manager',this.managers);
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