"use strict";

import Host from './Host';
import logger from './Logger';

class Hosts  {
    
    constructor(){
        this.validHosts = [];
    }

    add(host) {
        if (host instanceof Host) {
            this.validHosts.push(host);
            //var tmpGroup = this.findGroupByName(group.name);
            //if (tmpGroup) {
            //    if (tmpGroup.gid !== group.gid) {
            //        logger.logAndThrow(`Group ${group.name} already exists with different group id`);
            //    } else {
            //        logger.logAndThrow(`Group ${group.name} already exists.`)
            //    }
            //} else {
            //    tmpGroup = group.gid ? this.findGroupByGid(group.gid) : undefined;
            //    if (tmpGroup) {
            //        logger.logAndThrow(`Group ${group.name} with gid ${group.gid} already exists as ${tmpGroup.name} with gid ${tmpGroup.gid}.`);
            //    } else {
            //        this.validGroups.push(group);
            //    }
            //}
        } else {
            logger.logAndThrow("Parameter host must be of type Host");
        }
    }

    toJSON(){
        var str = '[';
        this.validHosts.forEach((host,hindex)=> {
            str+=host.toJSON();
            if (hindex !== this.validHosts.length - 1) {
                str += ",";
            }
        });
        str+="]";
        return str;
    }

    clear(){
        this.validHosts=[];
    }
}


export default Hosts;