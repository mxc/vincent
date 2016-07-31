/**
 * Created by mark on 2016/07/30.
 */

import RepositoryManager from './RepositoryManager';
import Package from './Package';
import {logger} from './../../../Logger';


class AptRepositoryManager extends RepositoryManager {

    constructor(provider,data){
        super(provider,data);
        this.data.cacheValidTime=600;
    }

    get cacheValidTime(){
        return this.data.cacheValidTime;
    }

    set cacheValidTime(cacheValidTime){
        this.data.cacheValidTime=cacheValidTime;
    }

    addRepository(){
        throw new Error("Not yet implemented");
    }


}

export default AptRepositoryManager;