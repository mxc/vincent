/**
 * Created by mark on 2016/07/28.
 */

'use strict';

import {logger} from '../../Logger';
import Base from '../../modules/base/Base';
import User from '../user/User';

class HistoryEntry {

    constructor(timestamp,status,entry,errors){
        if (!(timestamp instanceof Date) && typeof timestamp!=="number"){
            throw new Error("Parameter timestamp must be a Date object or an integer.");
        }
        let regex=/passed|failed/;
        if(!regex.test(status)){
            throw new Error("Parameter status must be either passed or failed");
        }
        this.status=status;
        this.entry=entry;
        this.timestamp=timestamp instanceof Date? timestamp.getTime():timestamp;
        this.errors=errors;
    }
    
    export(){
        return this;
    }
   
}


export default HistoryEntry;