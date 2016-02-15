"use strict";

import logger from './Logger';

class Group {

    constructor(data) {
        //check if we were passed a group name or a data object
        if (typeof data === 'string'){
            var valid = /\w/;
            if (!valid.test(data)) {
                logger.logAndThrow(`${data} is an invalid group name`);
            }
            this.data = {
                name: data,
                state:"present"
            };
        }

        if (!data.name) {
            logger.logAndThrow("The parameter data must be a group name or an object with a mandatory property \"name\".");
        }

        if (data.gid && typeof data.gid !== 'number'){
            logger.logAndThrow("Gid must be a number.");
        }

        if(data.state && data.state!="present" && data.state!="absent"){
            logger.logAndThrow("Group state must be \"present\" or \"absent\".");
        }
        this.data = {
            name: data.name,
            gid: data.gid,
            state: data.state?data.state:"present"
        };
    }

    get name() {
        return this.data.name;
    }

    get gid() {
        return this.data.gid;
    }

    set gid(gid) {
        this.data.gid = gid;
    }

    get state() {
        return this.data.state;
    }

    set state(state) {
        if (state !== "present" && state !== "absent") {
            logger.logAndThrow(`Group state is either present or absent not ${state}`);
        }else{
            this.data.state=state;
        }
    }

    equals(group) {
        if (!group instanceof Group) {
            return false;
        } else {
            return group.name === this.data.name && group.gid == this.gid;
        }
    }

    clone(){
        return new Group(this.data);
    }

    toJSON(){
        return JSON.stringify(this.data);
    }

}

export default Group;