/**
 * Created by mark on 2016/04/27.
 */


import logger from '../Logger';

class AppUser {

    constructor(name,groups,primaryGroup) {
        //if no user groups are defined place user in own group
        if (!groups) {
            groups = [name];
        }

        this.name = name;
        this.groups = groups;
        if (groups.indexOf("root") != -1 ||
            groups.indexOf("vadmin") != -1) {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
        }
        //set primary group is defined or default if not defined
        if (primaryGroup ) {
           if(typeof primaryGroup === "string") {
               this.primaryGroup = primaryGroup;
           }else{
               logger.logAndThrow("Primary group must be a string");
           }
        } else {
            this.primaryGroup = groups[0];
        }
        if (groups.indexOf(primaryGroup)==-1){
                groups.push(primaryGroup);
        }
    }

}

export default AppUser;