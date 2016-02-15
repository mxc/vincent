"use strict";

import Group from './Group';
import logger from './Logger';

class Groups {

    constructor() {
        this.validGroups = [];
        this.groupCategories=[];
    }

    add(group) {
        if (group instanceof Group) {
            var tmpGroup = this.findGroupByName(group.name);
            if (tmpGroup) {
                if (tmpGroup.gid !== group.gid) {
                    logger.logAndThrow(`Group ${group.name} already exists with different group id`);
                } else {
                    logger.logAndThrow(`Group ${group.name} already exists.`)
                }
            } else {
                tmpGroup = group.gid ? this.findGroupByGid(group.gid) : undefined;
                if (tmpGroup) {
                    logger.logAndThrow(`Group ${group.name} with gid ${group.gid} already exists as ${tmpGroup.name} with gid ${tmpGroup.gid}.`);
                } else {
                    this.validGroups.push(group);
                }
            }
        } else {
            logger.logAndThrow("Parameter group must be of type Group");
        }
    }

    findGroup(group) {
        if (group instanceof Group) {
            return this.validGroups.find((mgroup) => {
                return mgroup.equals(group);
            });
        } else {
            logger.logAndThrow(`The parameter group is not an instance of Group`);
        }
    }

    findGroupByName(group) {
        if (typeof group === 'string') {
            return this.validGroups.find((mgroup) => {
                if (mgroup.name === group) {
                    return mgroup;
                }
            });
        } else {
            logger.logAndThrow(`The parameter group should be a group name string`);
        }
    }

    findGroupByGid(gid) {
        if (!gid) {
            logger.warn("gid is undefined");
            return;
        }
        if (typeof gid === 'number') {
           return this.validGroups.find((mgroup) => {
                if (mgroup.gid === gid) {
                    return mgroup;
                }
            });
        } else {
            logger.logAndThrow(`The parameter group should be a gid`);
        }
    }

    toJSON(){
        var str = "[";
        this.validGroups.forEach((group,index)=>{
            str+=group.toJSON();
            if (index != this.validGroups.length-1){
                str+=",";
            }
        });
        str+="]";
        return str;
    }

    clear(){
        this.validGroups=[];
    }

}

export default Groups;