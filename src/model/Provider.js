import Users from './Users';
import Groups from './Groups';
import Hosts from './Hosts';
import SshConfigs from './includes/SshConfigs';
import UserCategories from './includes/UserCategories';

class Provider {

    constructor() {
        this.configdir = "/home/mark/NetBeansProjects/ansible-coach/conf-example";
        this.users = new Users(this);
        this.groups = new Groups(this);
        this.hosts = new Hosts(this);
        this.sshconfigs = new SshConfigs(this);
        this.userCategories = new UserCategories(this);
    }


    clear() {
        this.users.clear();
        this.groups.clear();
        this.hosts.clear();
    }

    clearAll() {
        clear();
        this.sshconfigs.clear();
    }

}

export default Provider;