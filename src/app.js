import Base from 'modules/base';
import ini from 'ini';
import fs from 'fs';

class App {

    constructor(){
        this.config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    }

    //load up all the configuration files.
    load(){
        this.groups = JSON.parse(fs.readFileSync(this.config.confdir+'groups.js'));
        this.users = JSON.parse(fs.readFileSync(this.config.confdir+'users.js'));
        this.hosts_includes = JSON.parse(fs.readFileSync(this.config.confdir+'hosts.js'));
        //includes
        this.ssh_includes = JSON.parse(fs.readFileSync(this.config.confdir+'includes/ssh-configs.js'));
        this.sudo_includes = JSON.parse(fs.readFileSync(this.config.confdir+'includes/sudo-entries.js'));
        this.users_includes = JSON.parse(fs.readFileSync(this.config.confdir+'includes/user-categories.js'));
        this.groups_includes = JSON.parse(fs.readFileSync(this.config.confdir+'includes/groups-categories.js'));
    }

    init(){
        var play = new Base(groups,users,hosts);
        if (!play.validateModel()){
            play.errors.forEach((error) =>{ console.log(error)});
        }
    }

}