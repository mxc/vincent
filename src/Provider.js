import Users from 'coremodel/collections/Users';
import Groups from 'coremodel/collections/Groups';
import Hosts from 'coremodel/collections/Hosts';
import SshConfigs from 'coremodel/includes/SshConfigs';
import UserCategories from 'coremodel/includes/UserCategories';
import GroupCategories from 'coremodel/includes/GroupCategories';

class Provider {

    constructor() {
        this.configdir = "/home/mark/NetBeansProjects/ansible-coach/conf-example";
        this.users = new Users(this);
        this.groups = new Groups(this);
        this.hosts = new Hosts(this);
        this.sshconfigs = new SshConfigs(this);
        this.userCategories = new UserCategories(this);
        this.groupCategories = new GroupCategories(this);
    }


    clear() {
        this.users.clear();
        this.groups.clear();
        this.hosts.clear();
    }

    clearAll() {
        this.clear();
        this.sshconfigs.clear();
        this.userCategories.clear();
    }

}

export default Provider;