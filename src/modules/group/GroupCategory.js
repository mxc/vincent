/**
 * Created by mark on 2016/05/14.
 */

import HostGroup from './HostGroup';    

class GroupCategory {
    
    constructor(name,hostGroups){
        if(typeof name!=='string' || ((hostGroups!==undefined) && ((hostGroups.length>0 && !hostGroups[0] instanceof HostGroup)))){
            throw new Error("Parameter name must be a string and parameter userAccounts must be an array of HostGroup.");
        }
        this.name = name;
        this.hostGroups = hostGroups;
    }

    export(){
        let obj={};
        obj.name =this.name;
        obj.config=[];
        this.hostGroups.forEach((hostgroup)=>{
            obj.config.push(hostGroup.export());
        });
        return obj;
    }
}

export default GroupCategory;