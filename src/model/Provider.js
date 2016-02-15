import Users from './Users';
import Groups from './Groups';
import Hosts from './Hosts';


class Provider {

    constructor() {
            this.users = new Users();
            this.groups = new Groups();
            this.hosts = new Hosts();
    }


    clear() {
        this.users.clear();
        this.groups.clear();
        this.hosts.clear();
    }

}

export default Provider;