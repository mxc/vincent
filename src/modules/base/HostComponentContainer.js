/**
 * Created by mark on 2016/05/28.
 */

import {logger} from '../../Logger';
import HostComponent from './HostComponent';

class HostComponentContainer {

    constructor(name){
        this.name=name;
        this.container={};
    }

    add(label,hostComponent){
        if (!(hostComponent instanceof HostComponent) && !(Array.isArray(hostComponent))){
            logger.logAndThrow("Parameter hostComponent must be a subtype of HostComponent.");
        }
        if(typeof label !=="string"){
            logger.logAndThrow("Parameter label must be a string.");
        }
        this.container[label] = hostComponent;
    }

    remove(label){
        if(typeof label !=="string"){
            logger.logAndThrow("Parameter label must be a string.");
        }
        delete this.container[label];
    }

    get(label){
        if(typeof label !=="string"){
            logger.logAndThrow("Parameter label must be a string.");
        }
        return this.container[label];
    }

    export(){
        let obj = {};
        let labels = Object.keys(this.container);
        labels.forEach((label)=>{
            if (Array.isArray(label)){
                    obj[label]= [];
                    label.forEach((item)=>{
                        obj[label].push(item.export);
                    });
            }else {
                obj[label] = this.container[label].export();
            }
        });
        return obj;
    }

}

export default HostComponentContainer;