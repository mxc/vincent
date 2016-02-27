/**
 * Created by mark on 2016/02/25.
 */

import fs from 'fs';
import dateformat from 'dateformat';
import logger from '../Logger';

class Saver {

    constructor(provider) {
        this.provider = provider;
    }

    export() {
        let archive = dateformat(new Date, "yyyy-mm-dd-HH:MM:ss");
        let historyDir = this.provider.config.get('confdir') + '/' + archive;
        let dbDir = this.provider.config.get('confdir') + '/db';
        fs.mkdir(historyDir);
        let dirItems = fs.readdirSync(dbDir);
        dirItems.forEach((item)=> {
            console.log(item);
            fs.renameSync(dbDir+"/"+item, historyDir+"/"+item);
        });
        let groups = JSON.stringify(this.provider.groups.export(),null,2);
        fs.writeFileSync(dbDir+"/groups.json",groups);
        let users = JSON.stringify(this.provider.users.export(),null,2);
        fs.writeFileSync(dbDir+"/users.json",users);
    }

}

export default Saver;