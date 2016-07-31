/**
 * Created by mark on 2016/07/25.
 */

import {logger} from './../../../Logger';
import HostComponent from '../../../modules/base/HostComponent';

class SystemUpdate extends HostComponent {
    
    constructor(provider,data){
        super(provider,data);
        this.upgrade=data.upgrade? data.upgrade:"no";
        this.updateCache=data.updateCache? data.updateCache:"no";
    }

    get updateCache(){
        return this.data.updateCache;
    }

    set updateCache(update){
        if (typeof update == "boolean"){
            update= update? "yes":"no";
        }
        
        let regex=/yes|no/;
        if(regex.test(update)){
            this.data.updateCache = update;
        }else{
            logger.logAndThrow("Parameter upgrade must be one of yes.no,safe,full,dist.");
        }
    }

    export(){
        return this.data;
    }

}

export default SystemUpdate;