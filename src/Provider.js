import Users from './coremodel/collections/Users';
import Groups from './coremodel/collections/Groups';
import Hosts from './coremodel/collections/Hosts';
import Database from './utilities/Database';
import SshConfigs from './coremodel/includes/SshConfigs';
import UserCategories from './coremodel/includes/UserCategories';
import GroupCategories from './coremodel/includes/GroupCategories';
import SudoerEntries from './coremodel/includes/SudoerEntries';
import Engine from './modules/AnsibleWorker';
import Config from './Config';

class Provider {

    constructor(path) {
        if (!path){
            path = process.cwd();
        }
        this.config = new Config(path+"/config.ini");
        this.users = new Users(this);
        this.groups = new Groups(this);
        this.hosts = new Hosts(this);
        this.sshConfigs = new SshConfigs(this);
        this.userCategories = new UserCategories(this);
        this.groupCategories = new GroupCategories(this);
        this.sudoerEntries = new SudoerEntries(this);
        this.database = new Database(this);
        this.engine = new Engine(this);
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