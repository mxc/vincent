/**
 * Created by mark on 2016/07/25.
 */

import SystemUpdate from './SystemUpdate';
import {logger} from './../../../Logger';

class Redhat extends SystemUpdate {

    constructor(provider,data){
        super(provider,data);
        if(typeof data === "object"){
            this.updateCache=data.updateCache;
            this.upgrade = data.upgrade;
        }
    }

    set upgrade(upgrade){
        if (typeof upgrade == "boolean"){
            upgrade= upgrade? "yes":"no";
        }
        let regex=/yes|no/;
        if(regex.test(upgrade)){
            this.data.upgrade = upgrade;
        }else{
            logger.logAndThrow("Parameter upgrade must be one of yes or no.");
        }
    }
    
    export(){
        return super.export();
    }
}

export default Redhat;