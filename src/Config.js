/**
 * Created by mark on 2016/02/25.
 */

import fs from 'fs';
import ini from  'ini';

class Config {


    constructor(path){
        this.config = ini.parse(fs.readFileSync(path,'utf-8'));
    }

    get(key){
        return this.config['key'];
    }

    set(key,value){
        this.config['key']= value;
    }

}

export default Config;