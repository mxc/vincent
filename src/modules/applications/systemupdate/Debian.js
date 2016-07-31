/**
 * Created by mark on 2016/07/25.
 */

import SystemUpdate from './SystemUpdate';
import {logger} from './../../../Logger';

class Debian extends SystemUpdate {

    constructor(provider,data){
        super(provider,data);
        if(typeof data === "object"){
            this.data.autoremove = data.autoremove? data.autoremove:"no";
        }
    }

    get upgrade(){
        return this.data.upgrade;
    }

    set upgrade(upgrade){
        if (typeof upgrade == "boolean"){
            upgrade= upgrade? "yes":"no";
        }
        let regex = /yes|no|safe|full|dist/;
        if (regex.test(upgrade)){
                this.data.upgrade=upgrade;
        }else{
            logger.logAndThrow("Parameter upgrade must be one of yes, no, safe, full, dist.");
        }
    }
    
    export(){
        return super.export();
    }
    
    get autoremove(){
        return this.data.autoremove;
    }
    
    set autoremove(remove){
        if (typeof remove == "boolean"){
            remove= remove? "yes":"no";
        }
        let regex=/yes|no/;
        if(regex.test(remove)){
            this.data.autoremove = remove;
        }else{
            logger.logAndThrow("Parameter remove must be one of yes or no.");
        }
    }
}

export default Debian;