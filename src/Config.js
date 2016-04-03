/**
 * Created by mark on 2016/02/25.
 */

import fs from 'fs';
import ini from  'ini';

class Config {


    constructor(filePath){
        this.config = ini.parse(fs.readFileSync(filePath,'utf-8'));
    }

    get(key){
        return this.config.settings[key];
    }

    set(key,value){
        this.config[key]= value;
    }

}

export default Config;