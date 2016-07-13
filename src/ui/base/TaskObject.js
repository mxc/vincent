/**
 * Created by mark on 2016/07/11.
 */

import HostComponent from '../../modules/base/HostComponent';

var data = new WeakMap();

class TaskObject {

    constructor(object){
        if(!object instanceof HostComponent){
            throw new Error("Parameter object must be an instance of HostComponent.");
        }
        data.set(this,object);
    }

    get becomeUser(){
        return data.get(this).becomeUser;
    }

    set becomeUser(becomeUser){
        data.get(this).becomeUser = becomeUser;
    }

    get become(){
        return data.get(this).become;
    }

    set become(become){
        data.get(this).become = become;
    }
    
}

export default TaskObject;