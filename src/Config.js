/**
 * Created by mark on 2016/02/25.
 */

import fs from 'fs';
import ini from  'ini';
import path from 'path';
import mkdirp from 'mkdirp';
import logger from './Logger';
import {EOL} from 'os';

class Config {

    constructor(filePath) {
        try {
            this.loc = path.resolve(filePath, "config.ini");
            var stat = fs.statSync(filePath);
            this.config = ini.parse(fs.readFileSync(this.loc, 'utf-8'));
            //ensure default values for db dir, engine dir, owner, group, permissions
            if (!this.config.settings.dbdir){
                this.config.settings.dbdir="db";
            }
            if (!this.config.settings.enginedir){
                this.config.settings.enginedir="engine";
            }
            if (!this.config.settings.owner){
                this.config.settings.owner="root";
            }
            if (!this.config.settings.group){
                this.config.settings.group="vincent";
            }
            if (!this.config.settings.permissions){
                this.config.settings.permissions="774";
            }
        } catch (e) {
            logger.warn("application directory for config.ini does not exists");
            mkdirp(filePath);
            let str =`; ansible-coach configuration file${EOL}[settings]${EOL}dbdir=db${EOL}enginedir=engine${EOL}`+
            `dbhost=localhost${EOL}dbuser=${EOL}dbpasswd=${EOL}dpport=5432${EOL}dbname=vincent${EOL}publickey=${EOL}`+
            `privatekey=${EOL}authtype=unix${EOL};authtype=db${EOL};authtype=ldap${EOL}`;
            fs.writeFileSync(this.loc,str, 'utf-8');
            this.config = {
                settings: {
                    dbdir: "db",
                    enginedir: "engine"
                }
            }
        }
    }

    get(key) {
        let val = this.config.settings[key];
        if (val) {
            return val;
        }
        else return "";
    }

    set(key, value) {
        this.config.settings[key] = value;
    }

    save(){
        let results = fs.writeFileSync(this.loc, ini.stringify(this.config));
    }
}

export default Config;