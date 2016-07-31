/**
 * Created by mark on 2016/07/30.
 */
'use strict';

import {logger} from '../../../../Logger';
import _ from 'lodash';

var data = new WeakMap();

class HistoryEntry  {

    constructor(entry){
        data.set(this,entry);
    }

    get status(){
        return data.get(this).status;
    }

    get entry(){
        return _.clone(data.get(this).entry);
    }

    get timestamp(){
        return data.get(this).timestamp;
    }


    get errors(){
        return _.clone(data.get(this).errors);
    }

    inspect(){
        let obj = {};
        obj.date = new Date(this.timestamp);
        obj.status =this.status;
        obj.timestamp=this.timestamp;
        return obj;
    }
}

export default HistoryEntry;