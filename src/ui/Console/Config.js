/**
 * Created by mark on 2016/04/17.
 */

import {session} from '../../Index';

const _config = Symbol("config");

class Config {

    constructor() {
        this[_config] = session.getProvider().config;
    }

    get configdir(){
        return `${session.getProvider().configDir} <-- read only. Change with cli option --configdir`;
    }
    get dbdir() {
        return this[_config].get("dbdir");
    }

    set dbdir(dir) {
        this[_config].set("dbdir",dir);
    }

    get enginedir() {
        return this[_config].get("enginedir");
    }

    set enginedir(dir) {
        this[_config].set("enginedir",dir);
   }

    get dbuser() {
        return this[_config].get("dbuser");
    }

    set dbuser(user) {
        this[_config].set("dbuser",user);
    }

    get dbname() {
        return this[_config].get("dbname");
    }

    set dbname(dbname) {
        this[_config].set("dbname",dbname);
    }

    get dbhost() {
        return this[_config].get("dbhost");
    }

    set dbhost(dbhost) {
        this[_config].set("dbhost",dbhost);
    }

    get dbport() {
        return this[_config].get("dbport");
    }

    set dbport(port) {
        this[_config].set("dbport",port);
    }

    set dbpasswd(passwd) {
        this[_config].set("dbpasswd",passwd);
    }

    save(){
        this[_config].save();
    }

    inspect() {
        return {
            configdir: this.configdir,
            dbdir: this.dbdir,
            enginedir: this.enginedir,
            dbhost: this.dbhost,
            dbname: this.dbname,
            dbuser: this.dbuser,
            dbport: this.dbport

        }
    }
}

export default Config;