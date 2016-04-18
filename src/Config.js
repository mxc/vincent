/**
 * Created by mark on 2016/02/25.
 */

import fs from 'fs';
import ini from  'ini';
import path from 'path';
import mkdirp from 'mkdirp';
import logger from './Logger';

class Config {

    constructor(filePath) {
        try {
            this.loc = path.resolve(filePath, "config.ini");
            var stat = fs.statSync(filePath);
            this.config = ini.parse(fs.readFileSync(this.loc, 'utf-8'));
            //ensure default values for db dir and engine dir
            if (!this.config.settings.dbdir){
                this.config.settings.dbdir="db";
            }
            if (!this.config.settings.enginedir){
                this.config.settings.enginedir="engine";
            }
        } catch (e) {
            logger.warn("application directory for config.ini does not exists");
            mkdirp(filePath);
            let str ="; ansible-coach configuration file\n\r[settings]\n\rdbdir=db\n\renginedir=engine\n\r" +
                "dbhost=localhost\n\rdbuser=\n\rdbpasswd=\n\rdpport=5432\n\rdbname=vincent";
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